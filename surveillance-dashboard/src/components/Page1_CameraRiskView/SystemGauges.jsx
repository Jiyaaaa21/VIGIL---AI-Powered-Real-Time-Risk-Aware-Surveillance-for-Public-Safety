import React, { useEffect, useState } from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================================================
// CIRCULAR GAUGE COMPONENT
// ============================================================================

const CircularGauge = ({ value, max, label, color, unit = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90" className="transform -rotate-90">
        <circle
          cx="45"
          cy="45"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth="8"
        />
        <circle
          cx="45"
          cy="45"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      <div className="absolute flex items-center justify-center w-[90px] h-[90px]">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-100">
            {typeof value === 'number' ? value.toFixed(value < 10 ? 2 : 0) : value}{unit}
          </p>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 mt-2 text-center font-medium">{label}</p>
    </div>
  );
};

// ============================================================================
// SPARKLINE COMPONENT
// ============================================================================

const Sparkline = ({ data, color, width = 150, height = 40 }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots on data points */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            opacity={index === data.length - 1 ? 1 : 0.5}
          />
        );
      })}
    </svg>
  );
};

// ============================================================================
// SYSTEM GAUGES COMPONENT
// ============================================================================

const SystemGauges = () => {
  const { state } = useGlobalState();
  const [riskHistory, setRiskHistory] = useState([0.15, 0.15, 0.15, 0.15, 0.15]);

  // Calculate total cameras dynamically
  const totalCameras = state.cameras.length;
  const camerasOnline = state.cameras.filter(c => c.status !== 'offline').length;

  // Calculate average system risk
  const averageRisk = state.cameras.reduce((sum, cam) => sum + cam.riskScore, 0) / totalCameras;

  // Update risk history
  useEffect(() => {
    setRiskHistory(prev => {
      const updated = [...prev, averageRisk];
      return updated.slice(-10); // Keep last 10 data points
    });
  }, [averageRisk]);

  // Calculate trend
  const getTrend = () => {
    if (riskHistory.length < 2) return 'stable';
    const recent = riskHistory.slice(-3);
    const older = riskHistory.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / (older.length || 1);
    
    if (recentAvg > olderAvg + 0.05) return 'rising';
    if (recentAvg < olderAvg - 0.05) return 'falling';
    return 'stable';
  };

  const trend = getTrend();

  // Get color for alert gauge
  const getAlertColor = () => {
    if (state.system.activeAlerts >= 3) return '#ef4444';
    if (state.system.activeAlerts > 0) return '#f59e0b';
    return '#10b981';
  };

  // Get color for risk gauge
  const getRiskColor = () => {
    if (averageRisk >= 0.70) return '#ef4444';
    if (averageRisk >= 0.40) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="space-y-3">
      {/* Main Gauges */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-around items-center gap-2">
          <div className="relative">
            <CircularGauge
              value={state.system.activeAlerts}
              max={10}
              label="Active Alerts"
              color={getAlertColor()}
            />
          </div>

          <div className="relative">
            <CircularGauge
              value={averageRisk}
              max={1}
              label="Avg Risk"
              color={getRiskColor()}
            />
          </div>

          <div className="relative">
            <CircularGauge
              value={camerasOnline}
              max={totalCameras}
              label="Cameras Online"
              color="#10b981"
              unit={`/${totalCameras}`}
            />
          </div>
        </div>
      </div>

      {/* Risk Trend Panel */}
      <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-0.5">
              Risk Trend
            </h4>
            <p className="text-xs text-slate-500">Last {riskHistory.length} snapshots</p>
          </div>
          <div className="flex items-center gap-1">
            {trend === 'rising' && (
              <>
                <TrendingUp className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">Rising</span>
              </>
            )}
            {trend === 'falling' && (
              <>
                <TrendingDown className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-400">Falling</span>
              </>
            )}
            {trend === 'stable' && (
              <>
                <Minus className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">Stable</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center py-2">
          <Sparkline 
            data={riskHistory} 
            color={getRiskColor()}
            width={280}
            height={50}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Older</span>
          <span>Current: {averageRisk.toFixed(2)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800 rounded p-2 border border-slate-700">
          <p className="text-xs text-slate-500">High Risk</p>
          <p className="text-lg font-bold text-red-400">
            {state.cameras.filter(c => c.status === 'high_risk').length}
          </p>
        </div>
        <div className="bg-slate-800 rounded p-2 border border-slate-700">
          <p className="text-xs text-slate-500">Suspicious</p>
          <p className="text-lg font-bold text-amber-400">
            {state.cameras.filter(c => c.status === 'suspicious').length}
          </p>
        </div>
        <div className="bg-slate-800 rounded p-2 border border-slate-700">
          <p className="text-xs text-slate-500">Normal</p>
          <p className="text-lg font-bold text-green-400">
            {state.cameras.filter(c => c.status === 'normal').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemGauges;