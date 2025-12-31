import React, { useState } from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { getColorFromStatus } from '../../utils/constants';

const ZoneMap = () => {
  const { state, actions } = useGlobalState();
  const [hoveredZone, setHoveredZone] = useState(null);
  const [hoveredCamera, setHoveredCamera] = useState(null);
  const [clickedCamera, setClickedCamera] = useState(null);
  const [heatmapMode, setHeatmapMode] = useState(false); // NEW

  const getZoneColor = (zoneId) => {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return '#10b981';
    return getColorFromStatus(zone.status);
  };

  const getCameraColor = (cameraId) => {
    const camera = state.cameras.find(c => c.id === cameraId);
    if (!camera) return '#10b981';
    return getColorFromStatus(camera.status);
  };

  // Get heatmap color based on risk level
  const getHeatmapColor = (risk) => {
    if (risk >= 0.7) return '#ef4444'; // Red
    if (risk >= 0.4) return '#f59e0b'; // Orange/Yellow
    return '#10b981'; // Green
  };

  const getHeatmapOpacity = (zoneId) => {
    const zone = state.zones.find(z => z.id === zoneId);
    if (!zone) return 0.1;
    return Math.min(zone.aggregatedRisk * 0.7, 0.6);
  };

  // Get camera heatmap intensity (for heatmap mode)
  const getCameraHeatIntensity = (camera) => {
    return camera.riskScore;
  };

  const handleZoneClick = (zoneId) => {
    actions.selectZone(zoneId);
  };

  const handleCameraClick = (cameraId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Visual feedback
    setClickedCamera(cameraId);
    setTimeout(() => setClickedCamera(null), 300);
    
    // Open modal
    actions.openCameraModal(cameraId);
  };

  return (
    <div className="relative">
      {/* Heatmap Toggle Button */}
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={() => setHeatmapMode(!heatmapMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-lg ${
            heatmapMode 
              ? 'bg-orange-600 text-white' 
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {heatmapMode ? 'Heatmap ON' : 'Heatmap OFF'}
        </button>
      </div>

      {/* Heatmap Legend */}
      {heatmapMode && (
        <div className="absolute top-2 left-2 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg px-3 py-2 text-xs z-20 shadow-lg">
          <p className="text-slate-300 font-semibold mb-2">Risk Level</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-slate-400">Low (&lt;0.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-slate-400">Medium (0.4-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-400">High (&gt;0.7)</span>
            </div>
          </div>
        </div>
      )}

      <svg 
        width="100%" 
        height="240" 
        viewBox="0 0 320 240" 
        className="bg-slate-900 rounded-lg border border-slate-800"
      >
        {/* Radial gradients for heat map effect */}
        <defs>
          <radialGradient id="heatA" cx="50%" cy="50%">
            <stop 
              offset="0%" 
              stopColor={getZoneColor('ZONE_A')} 
              stopOpacity={getHeatmapOpacity('ZONE_A')} 
            />
            <stop 
              offset="100%" 
              stopColor={getZoneColor('ZONE_A')} 
              stopOpacity="0" 
            />
          </radialGradient>
          
          <radialGradient id="heatB" cx="50%" cy="50%">
            <stop 
              offset="0%" 
              stopColor={getZoneColor('ZONE_B')} 
              stopOpacity={getHeatmapOpacity('ZONE_B')} 
            />
            <stop 
              offset="100%" 
              stopColor={getZoneColor('ZONE_B')} 
              stopOpacity="0" 
            />
          </radialGradient>
          
          <radialGradient id="heatC" cx="50%" cy="50%">
            <stop 
              offset="0%" 
              stopColor={getZoneColor('ZONE_C')} 
              stopOpacity={getHeatmapOpacity('ZONE_C')} 
            />
            <stop 
              offset="100%" 
              stopColor={getZoneColor('ZONE_C')} 
              stopOpacity="0" 
            />
          </radialGradient>

          {/* Camera-specific heatmap gradients */}
          {state.cameras.map(camera => {
            const heatColor = getHeatmapColor(camera.riskScore);
            return (
              <radialGradient key={`cam-heat-${camera.id}`} id={`camHeat-${camera.id}`} cx="50%" cy="50%">
                <stop 
                  offset="0%" 
                  stopColor={heatColor} 
                  stopOpacity={camera.riskScore * 0.8} 
                />
                <stop 
                  offset="100%" 
                  stopColor={heatColor} 
                  stopOpacity="0" 
                />
              </radialGradient>
            );
          })}

          {/* Glow filter for high-risk zones */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Stronger glow for heatmap mode */}
          <filter id="heatGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Base map - dark blue teal background */}
        <rect width="320" height="240" fill="#0a1929"/>
        
        {/* Realistic curved street network */}
        <path d="M 0 60 Q 80 55 160 60 T 320 60" stroke="#1e3a52" strokeWidth="3" fill="none"/>
        <path d="M 0 120 Q 100 115 200 120 T 320 120" stroke="#1e3a52" strokeWidth="4" fill="none"/>
        <path d="M 0 180 Q 90 185 180 180 T 320 180" stroke="#1e3a52" strokeWidth="3" fill="none"/>
        
        <path d="M 80 0 Q 85 80 80 160 T 80 240" stroke="#1e3a52" strokeWidth="2" fill="none"/>
        <path d="M 160 0 Q 155 100 160 200 T 160 240" stroke="#1e3a52" strokeWidth="3" fill="none"/>
        <path d="M 240 0 Q 245 90 240 180 T 240 240" stroke="#1e3a52" strokeWidth="2" fill="none"/>
        
        {/* Building blocks */}
        <rect x="20" y="15" width="40" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="100" y="20" width="50" height="25" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="200" y="10" width="45" height="35" fill="#162b3d" opacity="0.6" rx="2"/>
        
        <rect x="30" y="75" width="35" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="180" y="70" width="50" height="35" fill="#162b3d" opacity="0.6" rx="2"/>
        
        <rect x="25" y="135" width="40" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="110" y="140" width="45" height="25" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="210" y="135" width="50" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        
        <rect x="40" y="195" width="40" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="150" y="200" width="45" height="25" fill="#162b3d" opacity="0.6" rx="2"/>
        <rect x="250" y="195" width="40" height="30" fill="#162b3d" opacity="0.6" rx="2"/>
        
        {/* Heat map overlays - Show based on mode */}
        {!heatmapMode ? (
          <>
            {/* Zone-based heat overlays (Normal mode) */}
            <ellipse
              cx="160"
              cy="40"
              rx="100"
              ry="50"
              fill="url(#heatA)"
              className="cursor-pointer transition-all duration-300 zone-interactive"
              onClick={() => handleZoneClick('ZONE_A')}
              onMouseEnter={() => setHoveredZone('ZONE_A')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ 
                opacity: hoveredZone === 'ZONE_A' ? 1 : 0.85,
                filter: state.ui.selectedZone === 'ZONE_A' ? 'brightness(1.3)' : 'brightness(1)'
              }}
            />
            
            <ellipse
              cx="150"
              cy="120"
              rx="110"
              ry="45"
              fill="url(#heatB)"
              className="cursor-pointer transition-all duration-300 zone-interactive"
              onClick={() => handleZoneClick('ZONE_B')}
              onMouseEnter={() => setHoveredZone('ZONE_B')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ 
                opacity: hoveredZone === 'ZONE_B' ? 1 : 0.85,
                filter: state.ui.selectedZone === 'ZONE_B' ? 'brightness(1.3)' : 'brightness(1)'
              }}
            />
            
            <ellipse
              cx="160"
              cy="200"
              rx="105"
              ry="40"
              fill="url(#heatC)"
              className="cursor-pointer transition-all duration-300 zone-interactive"
              onClick={() => handleZoneClick('ZONE_C')}
              onMouseEnter={() => setHoveredZone('ZONE_C')}
              onMouseLeave={() => setHoveredZone(null)}
              style={{ 
                opacity: hoveredZone === 'ZONE_C' ? 1 : 0.85,
                filter: state.ui.selectedZone === 'ZONE_C' ? 'brightness(1.3)' : 'brightness(1)'
              }}
            />
          </>
        ) : (
          <>
            {/* Camera-based heatmap overlays (Heatmap mode) */}
            {state.cameras.map(camera => {
              const adjustedPos = {
                x: (camera.position.x / 300) * 320,
                y: (camera.position.y / 360) * 240
              };
              const intensity = getCameraHeatIntensity(camera);
              
              return (
                <circle
                  key={`heat-${camera.id}`}
                  cx={adjustedPos.x}
                  cy={adjustedPos.y}
                  r={30 + (intensity * 30)} // Size based on risk
                  fill={`url(#camHeat-${camera.id})`}
                  style={{ pointerEvents: 'none' }}
                  filter="url(#heatGlow)"
                />
              );
            })}
          </>
        )}

        {/* Additional heat intensity layers for high-risk zones */}
        {!heatmapMode && state.zones.map(zone => {
          if (zone.aggregatedRisk < 0.40) return null;
          
          const positions = {
            'ZONE_A': { cx: 160, cy: 40 },
            'ZONE_B': { cx: 150, cy: 120 },
            'ZONE_C': { cx: 160, cy: 200 }
          };
          
          const pos = positions[zone.id];
          if (!pos) return null;
          
          return (
            <g key={`heat-${zone.id}`} style={{ pointerEvents: 'none' }}>
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r="40"
                fill={getZoneColor(zone.id)}
                opacity={zone.aggregatedRisk * 0.3}
                className="animate-pulse"
              />
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r="25"
                fill={getZoneColor(zone.id)}
                opacity={zone.aggregatedRisk * 0.5}
                className="animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </g>
          );
        })}
        
        {/* Camera Markers */}
        {state.cameras.map(camera => {
          const adjustedPos = {
            x: (camera.position.x / 300) * 320,
            y: (camera.position.y / 360) * 240
          };
          
          const isHighlighted = state.ui.highlightedCameras.includes(camera.id);
          const cameraColor = heatmapMode ? getHeatmapColor(camera.riskScore) : getCameraColor(camera.id);
          const isHighRisk = camera.status === 'high_risk';
          const isHovered = hoveredCamera === camera.id;
          const isClicked = clickedCamera === camera.id;
          
          return (
            <g
              key={camera.id}
              className="cursor-pointer camera-marker"
              style={{ pointerEvents: 'all' }}
              onMouseEnter={() => setHoveredCamera(camera.id)}
              onMouseLeave={() => setHoveredCamera(null)}
              onClick={(e) => handleCameraClick(camera.id, e)}
            >
              {/* Glow effect for high-risk cameras or heatmap mode */}
              {(isHighRisk || (heatmapMode && camera.riskScore > 0.4)) && (
                <circle
                  cx={adjustedPos.x}
                  cy={adjustedPos.y}
                  r={heatmapMode ? 12 + (camera.riskScore * 8) : 16}
                  fill={cameraColor}
                  fillOpacity={heatmapMode ? camera.riskScore * 0.6 : 0.4}
                  className="animate-pulse"
                  filter={heatmapMode ? "url(#heatGlow)" : "url(#glow)"}
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* Highlight effect for selected zone cameras */}
              {isHighlighted && !heatmapMode && (
                <>
                  <circle
                    cx={adjustedPos.x}
                    cy={adjustedPos.y}
                    r="14"
                    fill={cameraColor}
                    fillOpacity="0.3"
                    className="animate-pulse"
                    style={{ pointerEvents: 'none' }}
                  />
                  <circle
                    cx={adjustedPos.x}
                    cy={adjustedPos.y}
                    r="18"
                    fill="none"
                    stroke={cameraColor}
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    className="animate-ping"
                    style={{ pointerEvents: 'none' }}
                  />
                </>
              )}

              {/* Click feedback ring */}
              {isClicked && (
                <circle
                  cx={adjustedPos.x}
                  cy={adjustedPos.y}
                  r="12"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  opacity="0.8"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              
              {/* Hover ring */}
              {isHovered && !isClicked && (
                <circle
                  cx={adjustedPos.x}
                  cy={adjustedPos.y}
                  r="11"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.5"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              
              {/* Main camera marker - CLICKABLE */}
              <circle
                cx={adjustedPos.x}
                cy={adjustedPos.y}
                r={isHovered || (heatmapMode && camera.riskScore > 0.5) ? "10" : "8"}
                fill={cameraColor}
                fillOpacity="0.95"
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-200"
                style={{ 
                  cursor: 'pointer',
                  transform: isClicked ? 'scale(0.9)' : 'scale(1)',
                  transformOrigin: `${adjustedPos.x}px ${adjustedPos.y}px`
                }}
              />
              
              {/* Camera number */}
              <text
                x={adjustedPos.x}
                y={adjustedPos.y}
                textAnchor="middle"
                dy="3"
                fill="#fff"
                fontSize="8"
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {camera.id.split('_')[1]}
              </text>

              {/* Risk score label in heatmap mode */}
              {heatmapMode && (
                <text
                  x={adjustedPos.x}
                  y={adjustedPos.y + 18}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="7"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                  className="drop-shadow-lg"
                >
                  {camera.riskScore.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Zone boundary lines */}
        <line 
          x1="0" 
          y1="80" 
          x2="320" 
          y2="80" 
          stroke="#2a4a5c" 
          strokeWidth="1" 
          strokeDasharray="4,4" 
          opacity="0.3"
          style={{ pointerEvents: 'none' }}
        />
        <line 
          x1="0" 
          y1="160" 
          x2="320" 
          y2="160" 
          stroke="#2a4a5c" 
          strokeWidth="1" 
          strokeDasharray="4,4" 
          opacity="0.3"
          style={{ pointerEvents: 'none' }}
        />

        {/* Zone Labels */}
        {!heatmapMode && (
          <>
            <text 
              x="160" 
              y="25" 
              textAnchor="middle" 
              fill="#94a3b8" 
              fontSize="10" 
              fontWeight="600"
              opacity="0.7"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ZONE A - NORTH
            </text>
            <text 
              x="150" 
              y="105" 
              textAnchor="middle" 
              fill="#94a3b8" 
              fontSize="10" 
              fontWeight="600"
              opacity="0.7"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ZONE B - CENTRAL
            </text>
            <text 
              x="160" 
              y="185" 
              textAnchor="middle" 
              fill="#94a3b8" 
              fontSize="10" 
              fontWeight="600"
              opacity="0.7"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ZONE C - SOUTH
            </text>
          </>
        )}
      </svg>
      
      {/* Zone Hover Tooltip */}
      {hoveredZone && !hoveredCamera && !heatmapMode && (
        <div className="absolute top-1 right-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded px-3 py-2 text-xs shadow-lg pointer-events-none z-10">
          <p className="text-slate-200 font-semibold mb-1">
            {state.zones.find(z => z.id === hoveredZone)?.name}
          </p>
          <div className="space-y-0.5">
            <p className="text-slate-400 text-xs">
              Risk: <span className="text-slate-200 font-mono">{state.zones.find(z => z.id === hoveredZone)?.aggregatedRisk.toFixed(2)}</span>
            </p>
            <p className="text-slate-400 text-xs">
              Cameras: <span className="text-slate-200">{state.zones.find(z => z.id === hoveredZone)?.cameraIds.length}</span>
            </p>
          </div>
          <p className="text-slate-500 text-xs mt-1 italic">Click to highlight</p>
        </div>
      )}
      
      {/* Camera Hover Tooltip */}
      {hoveredCamera && (
        <div className="absolute bottom-1 left-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded px-3 py-2 shadow-lg pointer-events-none z-10">
          <p className="text-slate-200 font-semibold mb-1 font-mono">
            {hoveredCamera}
          </p>
          <div className="space-y-0.5">
            <p className="text-slate-400 text-xs">
              Risk: <span className="text-slate-200 font-mono">{state.cameras.find(c => c.id === hoveredCamera)?.riskScore.toFixed(2)}</span>
            </p>
            <p className="text-slate-400 text-xs">
              Status: <span className={`font-medium ${
                state.cameras.find(c => c.id === hoveredCamera)?.status === 'high_risk' ? 'text-red-400' :
                state.cameras.find(c => c.id === hoveredCamera)?.status === 'suspicious' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {state.cameras.find(c => c.id === hoveredCamera)?.status.replace('_', ' ')}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-700">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-blue-400 text-xs font-medium">Click for details</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoneMap;