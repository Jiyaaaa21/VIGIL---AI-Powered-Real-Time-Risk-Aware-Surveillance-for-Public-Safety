import React, { createContext, useContext, useReducer } from 'react';
import loggerService from '../services/loggerService';
import { INITIAL_CAMERAS, INITIAL_ZONES } from '../utils/constants';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  system: {
    mode: 'SIMULATION',
    lastUpdate: new Date().toISOString(),
    healthStatus: 'OPERATIONAL',
    activeAlerts: 0,
    snapshotRefreshRate: 5000
  },

  cameras: INITIAL_CAMERAS.map(cam => ({
    ...cam,
    lastUpdated: new Date().toISOString(),
    consecutiveHighRiskFrames: 0
  })),

  zones: INITIAL_ZONES,

  alerts: [],
  
  eventTimeline: [],
  
  logs: [],
  
  ui: {
    selectedZone: null,
    highlightedCameras: [],
    modalCamera: null,
    showAlertBanner: false,
    latestAlert: null
  }
};

// ============================================================================
// ACTION TYPES
// ============================================================================

export const ActionTypes = {
  UPDATE_CAMERA_RISK: 'UPDATE_CAMERA_RISK',
  UPDATE_ZONE_RISK: 'UPDATE_ZONE_RISK',
  GENERATE_ALERT: 'GENERATE_ALERT',
  RESOLVE_ALERT: 'RESOLVE_ALERT',
  ADD_TIMELINE_EVENT: 'ADD_TIMELINE_EVENT',
  UPDATE_SYSTEM_STATUS: 'UPDATE_SYSTEM_STATUS',
  DOWNLOAD_LOGS: 'DOWNLOAD_LOGS',
  SELECT_ZONE: 'SELECT_ZONE',
  HIGHLIGHT_CAMERAS: 'HIGHLIGHT_CAMERAS',
  OPEN_CAMERA_MODAL: 'OPEN_CAMERA_MODAL',
  CLOSE_CAMERA_MODAL: 'CLOSE_CAMERA_MODAL',
  SHOW_ALERT_BANNER: 'SHOW_ALERT_BANNER',
  HIDE_ALERT_BANNER: 'HIDE_ALERT_BANNER',
  RESET_STATE: 'RESET_STATE'
};

// ============================================================================
// REDUCER
// ============================================================================

const globalReducer = (state, action) => {
  let newState = { ...state };
  let logEntry = null;

  switch (action.type) {
    case ActionTypes.UPDATE_CAMERA_RISK: {
      const { cameraId, riskScore, confidence } = action.payload;
      
      newState.cameras = state.cameras.map(cam => {
        if (cam.id === cameraId) {
          const oldRisk = cam.riskScore;
          const oldStatus = cam.status;
          
          // Determine new status based on risk score
          let newStatus = 'normal';
          if (riskScore >= 0.70) newStatus = 'high_risk';
          else if (riskScore >= 0.40) newStatus = 'suspicious';
          
          // Track consecutive high-risk frames
          let consecutiveFrames = cam.consecutiveHighRiskFrames;
          if (newStatus === 'high_risk') {
            consecutiveFrames++;
          } else {
            consecutiveFrames = 0;
          }
          
          // Only log if there's a significant change
          if (Math.abs(riskScore - oldRisk) > 0.01 || newStatus !== oldStatus) {
            logEntry = loggerService.createLogEntry(
              'risk_change',
              cameraId,
              'camera',
              riskScore,
              confidence,
              newStatus,
              `Risk ${riskScore > oldRisk ? 'increased' : 'decreased'} from ${oldRisk.toFixed(2)} to ${riskScore.toFixed(2)}`
            );
          }
          
          return {
            ...cam,
            riskScore,
            confidence,
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            consecutiveHighRiskFrames: consecutiveFrames
          };
        }
        return cam;
      });
      
      newState.system = {
        ...state.system,
        lastUpdate: new Date().toISOString()
      };
      
      break;
    }

    case ActionTypes.UPDATE_ZONE_RISK: {
      const { zoneId, aggregatedRisk } = action.payload;
      
      newState.zones = state.zones.map(zone => {
        if (zone.id === zoneId) {
          const oldStatus = zone.status;
          let newStatus = 'normal';
          if (aggregatedRisk >= 0.70) newStatus = 'high_risk';
          else if (aggregatedRisk >= 0.40) newStatus = 'suspicious';
          
          // Only log if status changed
          if (newStatus !== oldStatus || Math.abs(aggregatedRisk - zone.aggregatedRisk) > 0.05) {
            logEntry = loggerService.createLogEntry(
              'zone_risk_change',
              zoneId,
              'zone',
              aggregatedRisk,
              null,
              newStatus,
              `Zone risk updated to ${aggregatedRisk.toFixed(2)} (${newStatus})`
            );
          }
          
          return {
            ...zone,
            aggregatedRisk,
            status: newStatus
          };
        }
        return zone;
      });
      
      break;
    }

    case ActionTypes.GENERATE_ALERT: {
      const { cameraId, riskScore, confidence, description } = action.payload;
      const camera = state.cameras.find(c => c.id === cameraId);
      
      // Check if alert already exists for this camera
      const existingAlert = state.alerts.find(
        a => a.cameraId === cameraId && a.status === 'active'
      );
      
      if (existingAlert) {
        return state; // Don't create duplicate alert
      }
      
      const newAlert = {
        id: `ALT_${Date.now()}_${cameraId}`,
        cameraId,
        zoneId: camera?.zone || 'UNKNOWN',
        riskScore,
        confidence,
        status: 'active',
        timestamp: new Date().toISOString(),
        description: description || 'High-risk activity detected'
      };
      
      newState.alerts = [...state.alerts, newAlert];
      newState.system = {
        ...state.system,
        activeAlerts: state.system.activeAlerts + 1
      };
      
      newState.ui = {
        ...state.ui,
        showAlertBanner: true,
        latestAlert: newAlert
      };
      
      logEntry = loggerService.createLogEntry(
        'alert_generated',
        newAlert.id,
        'alert',
        riskScore,
        confidence,
        'active',
        `Alert generated for ${cameraId}: ${newAlert.description}`
      );
      
      // Add to event timeline
      const timelineEvent = {
        id: `EVT_${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'alert',
        entityId: newAlert.id,
        systemAction: 'Alert Generated',
        details: `${cameraId} - ${newAlert.description}`
      };
      newState.eventTimeline = [timelineEvent, ...state.eventTimeline];
      
      break;
    }

    case ActionTypes.RESOLVE_ALERT: {
      const { alertId } = action.payload;
      
      newState.alerts = state.alerts.map(alert => {
        if (alert.id === alertId && alert.status === 'active') {
          logEntry = loggerService.createLogEntry(
            'alert_resolved',
            alertId,
            'alert',
            alert.riskScore,
            alert.confidence,
            'resolved',
            `Alert resolved for ${alert.cameraId} - Risk normalized`
          );
          
          return { ...alert, status: 'resolved' };
        }
        return alert;
      });
      
      const activeCount = newState.alerts.filter(a => a.status === 'active').length;
      newState.system = {
        ...state.system,
        activeAlerts: activeCount
      };
      
      // Add to event timeline
      const timelineEvent = {
        id: `EVT_${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'alert',
        entityId: alertId,
        systemAction: 'Alert Resolved',
        details: 'Risk normalized, alert closed'
      };
      newState.eventTimeline = [timelineEvent, ...state.eventTimeline];
      
      break;
    }

    case ActionTypes.ADD_TIMELINE_EVENT: {
      const { entityType, entityId, systemAction, details } = action.payload;
      
      const timelineEvent = {
        id: `EVT_${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType,
        entityId,
        systemAction,
        details
      };
      
      newState.eventTimeline = [timelineEvent, ...state.eventTimeline];
      
      logEntry = loggerService.createLogEntry(
        'timeline_event',
        entityId,
        entityType,
        null,
        null,
        'info',
        `${systemAction}: ${details}`
      );
      
      break;
    }

    case ActionTypes.UPDATE_SYSTEM_STATUS: {
      const { healthStatus } = action.payload;
      
      newState.system = {
        ...state.system,
        healthStatus,
        lastUpdate: new Date().toISOString()
      };
      
      logEntry = loggerService.createLogEntry(
        'system_status_change',
        'SYSTEM',
        'system',
        null,
        null,
        healthStatus,
        `System health status: ${healthStatus}`
      );
      
      break;
    }

    case ActionTypes.DOWNLOAD_LOGS: {
      loggerService.downloadCSV(state.logs);
      return state; // No state change
    }

    case ActionTypes.SELECT_ZONE: {
      const { zoneId } = action.payload;
      const zone = state.zones.find(z => z.id === zoneId);
      
      newState.ui = {
        ...state.ui,
        selectedZone: zoneId,
        highlightedCameras: zone ? zone.cameraIds : []
      };
      break;
    }

    case ActionTypes.HIGHLIGHT_CAMERAS: {
      const { cameraIds } = action.payload;
      newState.ui = {
        ...state.ui,
        highlightedCameras: cameraIds
      };
      break;
    }

    case ActionTypes.OPEN_CAMERA_MODAL: {
      const { cameraId } = action.payload;
      newState.ui = {
        ...state.ui,
        modalCamera: cameraId
      };
      break;
    }

    case ActionTypes.CLOSE_CAMERA_MODAL: {
      newState.ui = {
        ...state.ui,
        modalCamera: null
      };
      break;
    }

    case ActionTypes.SHOW_ALERT_BANNER: {
      const { alert } = action.payload;
      newState.ui = {
        ...state.ui,
        showAlertBanner: true,
        latestAlert: alert
      };
      break;
    }

    case ActionTypes.HIDE_ALERT_BANNER: {
      newState.ui = {
        ...state.ui,
        showAlertBanner: false
      };
      break;
    }

    case ActionTypes.RESET_STATE: {
      return {
        ...initialState,
        system: {
          ...initialState.system,
          lastUpdate: new Date().toISOString()
        },
        cameras: INITIAL_CAMERAS.map(cam => ({
          ...cam,
          lastUpdated: new Date().toISOString(),
          consecutiveHighRiskFrames: 0
        }))
      };
    }

    default:
      return state;
  }

  // Add log entry if one was created
  if (logEntry) {
    newState.logs = [...newState.logs, logEntry];
  }

  return newState;
};

// ============================================================================
// CONTEXT
// ============================================================================

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  const value = {
    state,
    dispatch,
    actions: {
      updateCameraRisk: (cameraId, riskScore, confidence) => {
        dispatch({
          type: ActionTypes.UPDATE_CAMERA_RISK,
          payload: { cameraId, riskScore, confidence }
        });
      },
      
      updateZoneRisk: (zoneId, aggregatedRisk) => {
        dispatch({
          type: ActionTypes.UPDATE_ZONE_RISK,
          payload: { zoneId, aggregatedRisk }
        });
      },
      
      generateAlert: (cameraId, riskScore, confidence, description) => {
        dispatch({
          type: ActionTypes.GENERATE_ALERT,
          payload: { cameraId, riskScore, confidence, description }
        });
      },
      
      resolveAlert: (alertId) => {
        dispatch({
          type: ActionTypes.RESOLVE_ALERT,
          payload: { alertId }
        });
      },
      
      addTimelineEvent: (entityType, entityId, systemAction, details) => {
        dispatch({
          type: ActionTypes.ADD_TIMELINE_EVENT,
          payload: { entityType, entityId, systemAction, details }
        });
      },
      
      updateSystemStatus: (healthStatus) => {
        dispatch({
          type: ActionTypes.UPDATE_SYSTEM_STATUS,
          payload: { healthStatus }
        });
      },
      
      downloadLogs: () => {
        dispatch({ type: ActionTypes.DOWNLOAD_LOGS });
      },
      
      selectZone: (zoneId) => {
        dispatch({
          type: ActionTypes.SELECT_ZONE,
          payload: { zoneId }
        });
      },
      
      highlightCameras: (cameraIds) => {
        dispatch({
          type: ActionTypes.HIGHLIGHT_CAMERAS,
          payload: { cameraIds }
        });
      },
      
      openCameraModal: (cameraId) => {
        dispatch({
          type: ActionTypes.OPEN_CAMERA_MODAL,
          payload: { cameraId }
        });
      },
      
      closeCameraModal: () => {
        dispatch({ type: ActionTypes.CLOSE_CAMERA_MODAL });
      },
      
      showAlertBanner: (alert) => {
        dispatch({
          type: ActionTypes.SHOW_ALERT_BANNER,
          payload: { alert }
        });
      },
      
      hideAlertBanner: () => {
        dispatch({ type: ActionTypes.HIDE_ALERT_BANNER });
      },
      
      resetState: () => {
        dispatch({ type: ActionTypes.RESET_STATE });
      }
    }
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};

export default GlobalStateContext;