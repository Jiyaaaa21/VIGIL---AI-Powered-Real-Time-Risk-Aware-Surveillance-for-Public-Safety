import React, { useEffect, useState, useMemo } from 'react';
import { X, Camera, MapPin, Activity, TrendingUp, Download, AlertCircle, Eye, Clock, Zap } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { getColorFromStatus, formatRiskScore, formatConfidence, formatTimestamp } from '../../utils/constants';

const CameraModal = () => {
  const { state, actions } = useGlobalState();
  const [activeTab, setActiveTab] = useState('overview');
  
  const camera = state.cameras.find(c => c.id === state.ui.modalCamera);
  
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        actions.closeCameraModal();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [actions]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      actions.closeCameraModal();
    }
  };

  // Get related cameras (same zone)
  const relatedCameras = useMemo(() => {
    if (!camera) return [];
    return state.cameras.filter(c => c.zone === camera.zone && c.id !== camera.id);
  }, [camera, state.cameras]);

  // Generate extended risk history (21 points for better chart)
  const riskHistory = useMemo(() => {
    if (!camera) return [];
    const history = [];
    const baseRisk = camera.riskScore;
    for (let i = 20; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.15;
      const pastRisk = Math.max(0.05, Math.min(0.95, baseRisk - (i * 0.02) + variance));
      history.push({
        timestamp: new Date(Date.now() - i * 5 * 60 * 1000),
        risk: pastRisk,
        label: i === 0 ? 'Now' : `${i * 5}m ago`
      });
    }
    return history;
  }, [camera]);

  // Download report
  const handleDownloadReport = () => {
    if (!camera) return;
    
    const report = {
      camera_id: camera.id,
      timestamp: new Date().toISOString(),
      risk_score: camera.riskScore,
      confidence: camera.confidence,
      status: camera.status,
      zone: zone?.name,
      consecutive_high_risk_frames: camera.consecutiveHighRiskFrames,
      alerts: cameraAlerts.map(a => ({
        id: a.id,
        timestamp: a.timestamp,
        description: a.description,
        status: a.status,
        risk_score: a.riskScore
      })),
      risk_history: riskHistory
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camera-report-${camera.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!camera) return null;

  const zone = state.zones.find(z => z.id === camera.zone);
  const statusColor = getColorFromStatus(camera.status);
  
  // Get camera's related alerts
  const cameraAlerts = state.alerts.filter(a => a.cameraId === camera.id);
  const activeAlert = cameraAlerts.find(a => a.status === 'active');

  // Get risk history for bar chart (last 5 snapshots)
  const shortRiskHistory = [
    camera.riskScore - 0.20,
    camera.riskScore - 0.15,
    camera.riskScore - 0.10,
    camera.riskScore - 0.05,
    camera.riskScore
  ].map(r => Math.max(0.1, Math.min(1.0, r)));

  // AI Detection details (simulated based on risk)
  const detectionDetails = [
    { type: 'Motion Detected', confidence: camera.confidence, detected: camera.riskScore > 0.3 },
    { type: 'Person Detected', confidence: Math.min(camera.confidence + 0.05, 0.99), detected: camera.riskScore > 0.4 },
    { type: 'Unusual Activity', confidence: Math.max(camera.confidence - 0.1, 0.7), detected: camera.riskScore > 0.6 },
    { type: 'Restricted Area Breach', confidence: camera.confidence, detected: camera.riskScore > 0.7 }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-start justify-between flex-shrink-0">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <Camera className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">{camera.id}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <p className="text-slate-400">{zone?.name || camera.zone}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              title="Download camera report"
            >
              <Download className="w-4 h-4" />
              Report
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                actions.closeCameraModal();
              }}
              className="text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 flex-shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'overview'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
              {activeTab === 'overview' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'analytics'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analytics
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'alerts'
                  ? 'text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alerts ({cameraAlerts.length})
              {activeTab === 'alerts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Camera Snapshot */}
                <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: statusColor }}>
                  <img
                    src={camera.imagePlaceholder}
                    alt={camera.id}
                    className="w-full"
                  />
                  <div className="absolute top-4 right-4">
                    <div 
                      className="px-4 py-2 rounded-lg font-bold text-sm uppercase backdrop-blur-md"
                      style={{
                        backgroundColor: `${statusColor}30`,
                        color: statusColor,
                        border: `2px solid ${statusColor}`
                      }}
                    >
                      {camera.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {/* Stats Grid - Enhanced with 4th stat */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold">Risk Score</p>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: statusColor }}>
                      {formatRiskScore(camera.riskScore)}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold">Confidence</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-200">
                      {formatConfidence(camera.confidence)}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold">High-Risk Frames</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-200">
                      {camera.consecutiveHighRiskFrames}
                    </p>
                  </div>

                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold">Last Updated</p>
                    </div>
                    <p className="text-lg font-bold text-slate-200">
                      {Math.floor((Date.now() - new Date(camera.lastUpdated)) / 1000)}s ago
                    </p>
                  </div>
                </div>

                {/* Active Alert Banner */}
                {activeAlert && (
                  <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-red-200 font-bold text-sm mb-1">ACTIVE ALERT</h3>
                        <p className="text-red-300/90 text-sm mb-2">{activeAlert.description}</p>
                        <p className="text-red-400/70 text-xs font-mono">
                          Generated at {formatTimestamp(activeAlert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Detection Details - NEW */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    AI Detection Analysis
                  </h3>
                  <div className="space-y-2">
                    {detectionDetails.map((detail, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${detail.detected ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`} />
                          <span className="text-sm text-slate-300">{detail.type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {(detail.confidence * 100).toFixed(0)}% confidence
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${detail.detected ? 'bg-red-900/30 text-red-400' : 'bg-slate-700 text-slate-500'}`}>
                            {detail.detected ? 'DETECTED' : 'Clear'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk History - Original bar chart */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Risk Trend (Last 5 Snapshots)</h3>
                  <div className="flex items-end gap-2 h-32">
                    {shortRiskHistory.map((risk, idx) => {
                      const height = (risk * 100);
                      const color = risk >= 0.70 ? '#ef4444' : risk >= 0.40 ? '#f59e0b' : '#10b981';
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <div 
                            className="w-full rounded-t transition-all duration-300"
                            style={{ 
                              height: `${height}%`,
                              backgroundColor: color,
                              opacity: idx === shortRiskHistory.length - 1 ? 1 : 0.5 + (idx * 0.1)
                            }}
                          />
                          <span className="text-xs text-slate-500 font-mono">
                            {risk.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Related Cameras - NEW */}
                {relatedCameras.length > 0 && (
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Related Cameras in {zone?.name}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {relatedCameras.slice(0, 6).map(relCam => (
                        <button
                          key={relCam.id}
                          onClick={() => actions.openCameraModal(relCam.id)}
                          className="bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded p-3 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-slate-300">{relCam.id}</span>
                            <span 
                              className="text-xs font-bold"
                              style={{ color: getColorFromStatus(relCam.status) }}
                            >
                              {relCam.riskScore.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {relCam.status.replace('_', ' ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Camera Details */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Camera Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Camera ID:</span>
                      <span className="ml-2 text-slate-200 font-semibold font-mono">{camera.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Zone:</span>
                      <span className="ml-2 text-slate-200 font-semibold">{zone?.name || camera.zone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Last Updated:</span>
                      <span className="ml-2 text-slate-200 font-mono">{formatTimestamp(camera.lastUpdated)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span 
                        className="ml-2 font-semibold capitalize"
                        style={{ color: statusColor }}
                      >
                        {camera.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Analytics Tab - NEW */}
            {activeTab === 'analytics' && (
              <>
                {/* Risk Timeline Chart */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Risk Timeline (Last 100 Minutes)</h3>
                  <div className="relative h-48">
                    <svg width="100%" height="100%" viewBox="0 0 800 180" className="overflow-visible">
                      {/* Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((value, idx) => (
                        <g key={idx}>
                          <line
                            x1="0"
                            y1={180 - value * 180}
                            x2="800"
                            y2={180 - value * 180}
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            opacity="0.3"
                          />
                          <text
                            x="5"
                            y={180 - value * 180 - 5}
                            fill="#64748b"
                            fontSize="10"
                          >
                            {value.toFixed(2)}
                          </text>
                        </g>
                      ))}

                      {/* Risk threshold lines */}
                      <line x1="0" y1={180 - 0.4 * 180} x2="800" y2={180 - 0.4 * 180} stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                      <line x1="0" y1={180 - 0.7 * 180} x2="800" y2={180 - 0.7 * 180} stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

                      {/* Risk line */}
                      <polyline
                        points={riskHistory.map((point, idx) => {
                          const x = (idx / (riskHistory.length - 1)) * 800;
                          const y = 180 - point.risk * 180;
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      {riskHistory.map((point, idx) => {
                        const x = (idx / (riskHistory.length - 1)) * 800;
                        const y = 180 - point.risk * 180;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r={idx === riskHistory.length - 1 ? "4" : "2"}
                            fill={statusColor}
                            opacity={idx === riskHistory.length - 1 ? 1 : 0.6}
                          />
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>100m ago</span>
                    <span>Current: {camera.riskScore.toFixed(2)}</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-xs text-slate-400 mb-2">Average Risk (Last Hour)</h4>
                    <p className="text-2xl font-bold text-slate-200">
                      {(riskHistory.reduce((sum, p) => sum + p.risk, 0) / riskHistory.length).toFixed(3)}
                    </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-xs text-slate-400 mb-2">Peak Risk</h4>
                    <p className="text-2xl font-bold text-red-400">
                      {Math.max(...riskHistory.map(p => p.risk)).toFixed(3)}
                    </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-xs text-slate-400 mb-2">Lowest Risk</h4>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.min(...riskHistory.map(p => p.risk)).toFixed(3)}
                    </p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="text-xs text-slate-400 mb-2">Risk Variance</h4>
                    <p className="text-2xl font-bold text-blue-400">
                      {(Math.max(...riskHistory.map(p => p.risk)) - Math.min(...riskHistory.map(p => p.risk))).toFixed(3)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Alerts Tab - Enhanced */}
            {activeTab === 'alerts' && (
              <div className="space-y-3">
                {cameraAlerts.length > 0 ? (
                  cameraAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.status === 'active' 
                          ? 'bg-red-950/30 border-red-900/50'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className={`w-4 h-4 ${alert.status === 'active' ? 'text-red-400' : 'text-slate-400'}`} />
                          <span className="font-semibold text-sm">{alert.description}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-medium uppercase ${
                          alert.status === 'active' 
                            ? 'bg-red-900 text-red-200'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Timestamp:</span>
                          <p className="text-slate-300 font-mono">{formatTimestamp(alert.timestamp)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Risk Score:</span>
                          <p className="text-slate-300 font-mono">{alert.riskScore.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Confidence:</span>
                          <p className="text-slate-300 font-mono">{(alert.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No alerts recorded for this camera</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              actions.closeCameraModal();
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;