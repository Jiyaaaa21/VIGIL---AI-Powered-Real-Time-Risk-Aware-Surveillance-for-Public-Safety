import React from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { getColorFromStatus, formatRiskScore } from '../../utils/constants';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

const ZoneStatusList = () => {
  const { state, actions } = useGlobalState();

  const handleZoneClick = (zoneId) => {
    actions.selectZone(zoneId);
  };

  const handleCameraClick = (cameraId, e) => {
    e.stopPropagation();
    actions.openCameraModal(cameraId);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'high_risk':
        return 'High Risk';
      case 'suspicious':
        return 'Suspicious';
      case 'normal':
      default:
        return 'Normal';
    }
  };

  // Calculate zone trend based on cameras
  const getZoneTrend = (zone) => {
    const cameras = zone.cameraIds.map(id => state.cameras.find(c => c.id === id)).filter(Boolean);
    const highRiskCount = cameras.filter(c => c.status === 'high_risk' || c.status === 'suspicious').length;
    const avgRisk = cameras.reduce((sum, c) => sum + c.riskScore, 0) / cameras.length;
    
    if (highRiskCount >= 2 || avgRisk > 0.5) return 'rising';
    if (avgRisk < 0.15) return 'falling';
    return 'stable';
  };

  // Get zone statistics
  const getZoneStats = (zone) => {
    const cameras = zone.cameraIds.map(id => state.cameras.find(c => c.id === id)).filter(Boolean);
    return {
      highRisk: cameras.filter(c => c.status === 'high_risk').length,
      suspicious: cameras.filter(c => c.status === 'suspicious').length,
      normal: cameras.filter(c => c.status === 'normal').length,
      offline: cameras.filter(c => c.status === 'offline').length
    };
  };

  return (
    <div className="space-y-2">
      {state.zones.map(zone => {
        const isSelected = state.ui.selectedZone === zone.id;
        const statusColor = getColorFromStatus(zone.status);
        const trend = getZoneTrend(zone);
        const stats = getZoneStats(zone);
        const hasAlerts = stats.highRisk > 0 || stats.suspicious > 0;

        return (
          <div
            key={zone.id}
            onClick={() => handleZoneClick(zone.id)}
            className={`bg-slate-800 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:bg-slate-750'
            }`}
            style={{
              borderLeft: `4px solid ${statusColor}`
            }}
          >
            <div className="flex justify-between items-start mb-2">
              {/* Left: Zone Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-slate-200">
                    {zone.name}
                  </h4>
                  {/* Status Indicator */}
                  <span
                    className={`w-2 h-2 rounded-full ${hasAlerts ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: statusColor }}
                  />
                  {/* Alert Icon */}
                  {hasAlerts && (
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {zone.id}
                </p>
              </div>

              {/* Right: Risk Score and Trend */}
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <p className="text-lg font-bold text-slate-200 font-mono">
                    {formatRiskScore(zone.aggregatedRisk)}
                  </p>
                  {/* Trend Icon */}
                  {trend === 'rising' && <TrendingUp className="w-4 h-4 text-red-400" />}
                  {trend === 'falling' && <TrendingDown className="w-4 h-4 text-green-400" />}
                  {trend === 'stable' && <Minus className="w-4 h-4 text-slate-500" />}
                </div>
                <p
                  className="text-xs font-semibold capitalize"
                  style={{ color: statusColor }}
                >
                  {getStatusText(zone.status)}
                </p>
              </div>
            </div>

            {/* Camera Status Summary Bar */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                {stats.highRisk > 0 && (
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(stats.highRisk / zone.cameraIds.length) * 100}%` }}
                  />
                )}
                {stats.suspicious > 0 && (
                  <div 
                    className="bg-yellow-500"
                    style={{ width: `${(stats.suspicious / zone.cameraIds.length) * 100}%` }}
                  />
                )}
                {stats.normal > 0 && (
                  <div 
                    className="bg-green-500"
                    style={{ width: `${(stats.normal / zone.cameraIds.length) * 100}%` }}
                  />
                )}
                {stats.offline > 0 && (
                  <div 
                    className="bg-slate-600"
                    style={{ width: `${(stats.offline / zone.cameraIds.length) * 100}%` }}
                  />
                )}
              </div>
            </div>

            {/* Camera Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {stats.highRisk > 0 && (
                  <span className="text-red-400 font-medium">
                    {stats.highRisk} High
                  </span>
                )}
                {stats.suspicious > 0 && (
                  <span className="text-yellow-400 font-medium">
                    {stats.suspicious} Susp
                  </span>
                )}
                {stats.normal > 0 && (
                  <span className="text-green-400 font-medium">
                    {stats.normal} Normal
                  </span>
                )}
              </div>
              <span className="text-slate-500">
                {zone.cameraIds.length} total
              </span>
            </div>

            {/* Expanded Camera List */}
            {isSelected && (
              <div className="mt-3 pt-3 border-t border-slate-700 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-slate-500 mb-2 font-medium">Cameras in this zone:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {zone.cameraIds.map(camId => {
                    const camera = state.cameras.find(c => c.id === camId);
                    const camColor = camera ? getColorFromStatus(camera.status) : '#64748b';
                    const camRisk = camera ? camera.riskScore : 0;
                    
                    return (
                      <button
                        key={camId}
                        onClick={(e) => handleCameraClick(camId, e)}
                        className="px-2 py-1.5 rounded text-xs font-semibold bg-slate-900 hover:bg-slate-800 transition-colors text-left flex items-center justify-between"
                        style={{ 
                          borderLeft: `2px solid ${camColor}`,
                          color: camColor 
                        }}
                      >
                        <span>{camId}</span>
                        <span className="text-slate-400 font-mono text-xs">
                          {camRisk.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-600 mt-2 italic">Click camera to view details</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ZoneStatusList;