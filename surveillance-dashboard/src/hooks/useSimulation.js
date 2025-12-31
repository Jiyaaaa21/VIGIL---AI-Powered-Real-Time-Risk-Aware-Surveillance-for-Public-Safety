import { useState, useEffect, useRef, useCallback } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { SYSTEM_CONFIG, SCENARIO_TIMELINE } from '../utils/constants';

// ============================================================================
// SIMULATION ENGINE HOOK
// ============================================================================

const useSimulation = () => {
  const { state, actions } = useGlobalState();
  const [isRunning, setIsRunning] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  // ============================================================================
  // INTERPOLATION HELPER
  // ============================================================================
  
  const lerp = (start, end, progress) => {
    return start + (end - start) * Math.min(Math.max(progress, 0), 1);
  };

  // ============================================================================
  // GET CAMERA RISK AT CURRENT TIME
  // ============================================================================
  
  const getCameraRisk = useCallback((cameraId, time) => {
    const scenario = SCENARIO_TIMELINE[cameraId];
    
    if (!scenario) {
      // Other cameras have small natural variations
      const baseCamera = state.cameras.find(c => c.id === cameraId);
      const baseRisk = baseCamera ? baseCamera.riskScore : 0.15;
      const variation = Math.sin(time / 10) * 0.02;
      return Math.max(0.1, Math.min(0.25, baseRisk + variation));
    }

    const { START_TIME, PEAK_TIME, START_RISK, PEAK_RISK, NORMALIZE_TIME } = scenario;

    // Before escalation starts
    if (time < START_TIME) {
      return START_RISK;
    }

    // During escalation (start -> peak)
    if (time >= START_TIME && time < PEAK_TIME) {
      const duration = PEAK_TIME - START_TIME;
      const progress = (time - START_TIME) / duration;
      return lerp(START_RISK, PEAK_RISK, progress);
    }

    // At peak
    if (time >= PEAK_TIME && time < PEAK_TIME + 5) {
      return PEAK_RISK;
    }

    // During de-escalation (peak -> normalize)
    if (time >= PEAK_TIME + 5 && time < NORMALIZE_TIME) {
      const duration = NORMALIZE_TIME - (PEAK_TIME + 5);
      const progress = (time - (PEAK_TIME + 5)) / duration;
      return lerp(PEAK_RISK, START_RISK, progress);
    }

    // After normalization
    return START_RISK;
  }, [state.cameras]);

  // ============================================================================
  // UPDATE SIMULATION STATE
  // ============================================================================
  
  const updateSimulation = useCallback(() => {
    const time = elapsedTime;

    // Update camera risks
    state.cameras.forEach(camera => {
      const newRisk = getCameraRisk(camera.id, time);
      const confidence = 0.88 + Math.random() * 0.08; // 0.88-0.96

      // Only update if there's a meaningful change
      if (Math.abs(newRisk - camera.riskScore) > 0.01) {
        actions.updateCameraRisk(camera.id, newRisk, confidence);
      }
    });

    // Update zone risks (aggregate from cameras)
    state.zones.forEach(zone => {
      const zoneCameras = state.cameras.filter(c => zone.cameraIds.includes(c.id));
      const avgRisk = zoneCameras.reduce((sum, cam) => sum + cam.riskScore, 0) / zoneCameras.length;
      
      if (Math.abs(avgRisk - zone.aggregatedRisk) > 0.01) {
        actions.updateZoneRisk(zone.id, avgRisk);
      }
    });

    // Check for alert generation (3 consecutive high-risk frames = 15 seconds)
    state.cameras.forEach(camera => {
      if (camera.consecutiveHighRiskFrames >= SYSTEM_CONFIG.ALERT_CONFIRMATION_FRAMES) {
        const existingAlert = state.alerts.find(
          a => a.cameraId === camera.id && a.status === 'active'
        );
        
        if (!existingAlert) {
          actions.generateAlert(
            camera.id,
            camera.riskScore,
            camera.confidence,
            'High-risk activity detected - Crowd violence emerging'
          );
        }
      }
    });

    // Check for alert resolution (risk normalized)
    state.alerts
      .filter(a => a.status === 'active')
      .forEach(alert => {
        const camera = state.cameras.find(c => c.id === alert.cameraId);
        if (camera && camera.riskScore < 0.40) {
          actions.resolveAlert(alert.id);
        }
      });

    // Auto-open modal for highest risk camera (only if not manually controlled)
    const highRiskCameras = state.cameras.filter(c => c.riskScore >= 0.70);

    if (highRiskCameras.length > 0) {
      const highestRiskCamera = highRiskCameras.reduce((prev, current) =>
        current.riskScore > prev.riskScore ? current : prev
      );
  
    // Only auto-open if:
    // 1. No modal is currently open, OR
    // 2. The highest risk camera changed AND current modal camera's risk is below 0.70
    const currentModalCamera = state.cameras.find(c => c.id === state.ui.modalCamera);
    const shouldAutoOpen = !state.ui.modalCamera || 
    (currentModalCamera && currentModalCamera.riskScore < 0.70 && 
      highestRiskCamera.id !== state.ui.modalCamera);
  
      if (shouldAutoOpen) {
      actions.openCameraModal(highestRiskCamera.id);
      }
    } else if (state.ui.modalCamera) {
    // Only auto-close if the current modal camera's risk dropped below 0.40
    const currentModalCamera = state.cameras.find(c => c.id === state.ui.modalCamera);
      if (currentModalCamera && currentModalCamera.riskScore < 0.40) {
        actions.closeCameraModal();
      }
    }

  }, [elapsedTime, state.cameras, state.zones, state.alerts, state.ui.modalCamera, actions, getCameraRisk]);

  // ============================================================================
  // MAIN SIMULATION LOOP
  // ============================================================================
  
  useEffect(() => {
    if (!isRunning) return;

    const interval = SYSTEM_CONFIG.SNAPSHOT_REFRESH_RATE / speed;

    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 5; // 5 second intervals
        
        // Loop logic: pause at 60s, then reset after 10 seconds
        if (next >= SYSTEM_CONFIG.SIMULATION_DURATION) {
          setIsRunning(false);
          
          pauseTimeoutRef.current = setTimeout(() => {
            setElapsedTime(0);
            actions.resetState();
            setIsRunning(true);
          }, SYSTEM_CONFIG.SIMULATION_PAUSE_DURATION);
          
          return SYSTEM_CONFIG.SIMULATION_DURATION;
        }
        
        return next;
      });
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [isRunning, speed, actions]);

  // ============================================================================
  // UPDATE SIMULATION WHEN TIME CHANGES
  // ============================================================================
  
  useEffect(() => {
    if (isRunning && elapsedTime < SYSTEM_CONFIG.SIMULATION_DURATION) {
      updateSimulation();
    }
  }, [elapsedTime, isRunning, updateSimulation]);

  // ============================================================================
  // CONTROL FUNCTIONS
  // ============================================================================
  
  const toggleRunning = () => {
    setIsRunning(prev => !prev);
  };

  const reset = () => {
    setElapsedTime(0);
    actions.resetState();
    setIsRunning(true);
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const pause = () => {
    setIsRunning(false);
  };

  const resume = () => {
    setIsRunning(true);
  };

  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };

  // ============================================================================
  // RETURN VALUES
  // ============================================================================
  
  return {
    isRunning,
    elapsedTime,
    speed,
    progress: (elapsedTime / SYSTEM_CONFIG.SIMULATION_DURATION) * 100,
    toggleRunning,
    reset,
    pause,
    resume,
    setSpeed: changeSpeed
  };
};

export default useSimulation;