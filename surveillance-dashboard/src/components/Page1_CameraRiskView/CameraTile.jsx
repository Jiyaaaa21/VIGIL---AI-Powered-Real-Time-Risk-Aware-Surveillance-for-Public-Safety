import React, { useState, useMemo } from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { getColorFromStatus, formatRiskScore, formatConfidence } from '../../utils/constants';
import { Activity, Wifi, WifiOff, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

const CameraTile = ({ camera }) => {
  const { state, actions } = useGlobalState();
  const [isHovered, setIsHovered] = useState(false);
  
  const isHighlighted = state.ui.highlightedCameras.includes(camera.id);
  const borderColor = getColorFromStatus(camera.status);

  // Calculate risk trend (simulated based on consecutive frames and current risk)
  const riskTrend = useMemo(() => {
    if (camera.consecutiveHighRiskFrames > 2) {
      return 'rising';
    } else if (camera.riskScore < 0.2 && camera.consecutiveHighRiskFrames === 0) {
      return 'falling';
    } else if (camera.riskScore >= 0.4 && camera.riskScore < 0.7) {
      return 'stable-elevated';
    }
    return 'stable';
  }, [camera.riskScore, camera.consecutiveHighRiskFrames]);

  // Risk prediction
  const riskPrediction = useMemo(() => {
    if (camera.consecutiveHighRiskFrames >= 2 && camera.riskScore >= 0.5) {
      return { status: 'increasing', label: 'Risk Increasing', color: 'text-red-400', bgColor: 'bg-red-900/30' };
    } else if (camera.riskScore >= 0.65 && camera.consecutiveHighRiskFrames >= 1) {
      return { status: 'critical-soon', label: 'Critical Soon', color: 'text-orange-400', bgColor: 'bg-orange-900/30' };
    } else if (camera.riskScore < 0.15 && camera.consecutiveHighRiskFrames === 0) {
      return { status: 'stable', label: 'Stable', color: 'text-green-400', bgColor: 'bg-green-900/30' };
    }
    return null;
  }, [camera.riskScore, camera.consecutiveHighRiskFrames]);

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((new Date() - new Date(camera.lastUpdated)) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    actions.openCameraModal(camera.id);
  };

  // Streaming status
  const isStreaming = camera.status !== 'offline';
  const streamDelay = Math.floor((new Date() - new Date(camera.lastUpdated)) / 1000);
  const isDelayed = streamDelay > 10;

  // Get trend icon
  const getTrendIcon = () => {
    switch (riskTrend) {
      case 'rising':
        return <TrendingUp className="w-3 h-3 text-red-400" />;
      case 'falling':
        return <TrendingDown className="w-3 h-3 text-green-400" />;
      case 'stable-elevated':
        return <Minus className="w-3 h-3 text-yellow-400" />;
      default:
        return <Minus className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden transition-all duration-200 cursor-pointer camera-tile group"
      style={{
        border: `2px solid ${borderColor}`,
        boxShadow: isHighlighted ? `0 0 20px ${borderColor}` : 'none',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Camera Image Container */}
      <div className="relative aspect-video bg-slate-950">
        {/* Solid background to prevent placeholder text from showing */}
        <div className="absolute inset-0 bg-slate-950" />
        
        {/* Camera Image - Hidden to prevent placeholder text */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

        {/* Top Overlays */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 z-10">
          {/* Camera ID Badge */}
          <div className="bg-black/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-white shadow-lg">
            {camera.id}
          </div>

          {/* Status Badges - Top Right */}
          <div className="flex items-center gap-1.5">
            {/* Heartbeat Indicator */}
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm px-1.5 py-1 rounded shadow-lg">
              {isStreaming ? (
                <Wifi className={`w-3 h-3 ${isDelayed ? 'text-yellow-400' : 'text-green-400'}`} />
              ) : (
                <WifiOff className="w-3 h-3 text-red-400" />
              )}
            </div>

            {/* Risk Badge with Trend */}
            <div 
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold backdrop-blur-sm shadow-lg"
              style={{
                backgroundColor: `${borderColor}40`,
                color: borderColor,
                border: `1px solid ${borderColor}80`
              }}
            >
              {getTrendIcon()}
              {formatRiskScore(camera.riskScore)}
            </div>
          </div>
        </div>

        {/* Risk Prediction Badge - NEW */}
        {riskPrediction && (
          <div className="absolute top-11 left-2 z-10">
            <div 
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm shadow-lg ${riskPrediction.bgColor} ${riskPrediction.color} border border-current/30`}
            >
              <Zap className="w-3 h-3" />
              {riskPrediction.label}
            </div>
          </div>
        )}

        {/* Status Bar - Below top badges */}
        {camera.status !== 'normal' && (
          <div className="absolute top-11 right-2 z-10">
            <div 
              className="px-2 py-0.5 rounded text-xs font-semibold uppercase backdrop-blur-sm animate-pulse shadow-lg"
              style={{
                backgroundColor: `${borderColor}50`,
                color: borderColor,
                border: `1px solid ${borderColor}90`
              }}
            >
              {camera.status === 'high_risk' ? '⚠ High Risk' : '⚡ Suspicious'}
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-2 py-1.5 z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {getTimeSinceUpdate()} ago
            </span>
            {camera.consecutiveHighRiskFrames > 0 && (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {camera.consecutiveHighRiskFrames}x
              </span>
            )}
          </div>
        </div>

        {/* Simplified Hover Overlay - CLEANER */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-white transition-opacity duration-200 z-30">
            <div className="text-center space-y-4 px-4 w-full">
              {/* Large Risk Score */}
              <div>
                <p className="text-4xl font-bold mb-1" style={{ color: borderColor }}>
                  {formatRiskScore(camera.riskScore)}
                </p>
                <p className="text-xs text-slate-400">Risk Score</p>
              </div>

              {/* Horizontal Divider */}
              <div className="w-16 h-px bg-slate-600 mx-auto" />

              {/* Simple Info Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Confidence</span>
                  <span className="font-semibold text-slate-200">{formatConfidence(camera.confidence)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Zone</span>
                  <span className="font-medium text-slate-200">
                    {state.zones.find(z => z.id === camera.zone)?.name || camera.zone}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Status</span>
                  <span 
                    className="font-semibold capitalize"
                    style={{ color: borderColor }}
                  >
                    {camera.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Horizontal Divider */}
              <div className="w-16 h-px bg-slate-600 mx-auto" />

              {/* Click hint */}
              <p className="text-xs text-slate-500">Click to view details</p>
            </div>
          </div>
        )}

        {/* Simulated Camera Feed Pattern */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="opacity-10">
            <defs>
              <pattern id={`grid-${camera.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#grid-${camera.id})`} />
          </svg>
        </div>
      </div>

      {/* High Risk Pulse Effect */}
      {camera.status === 'high_risk' && (
        <div
          className="absolute inset-0 rounded-lg pointer-events-none z-5"
          style={{
            boxShadow: `inset 0 0 30px ${borderColor}40`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Trend Indicator Line - Bottom left corner */}
      <div className="absolute bottom-0 left-0 w-12 h-1 z-20">
        <div 
          className={`h-full ${
            riskTrend === 'rising' ? 'bg-red-500' :
            riskTrend === 'falling' ? 'bg-green-500' :
            riskTrend === 'stable-elevated' ? 'bg-yellow-500' :
            'bg-slate-500'
          }`}
          style={{
            boxShadow: `0 0 8px currentColor`
          }}
        />
      </div>
    </div>
  );
};

export default CameraTile;