import React, { useState, useEffect, useRef } from 'react';
import Header from '../shared/Header';
import SimulationControls from '../shared/SimulationControls';
import { useGlobalState } from '../../context/GlobalStateContext';
import {
  MapPin,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Shield,
  Clock,
  Target,
  Layers,
  ArrowRight,
  Radio,
  Eye,
  Maximize2
} from 'lucide-react';

// ============================================================================
// ANIMATED PARTICLES BACKGROUND
// ============================================================================

const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 1
    }));

    let animationId;
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 25, 41, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
};

// ============================================================================
// INTERACTIVE ZONE RISK HEATMAP
// ============================================================================

const ZoneRiskHeatmap = () => {
  const { state, actions } = useGlobalState();
  const [hoveredCell, setHoveredCell] = useState(null);
  const [animateWave, setAnimateWave] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateWave(prev => (prev + 1) % 30);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const getRiskIntensity = (risk) => Math.floor(risk * 10);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Scan line effect */}
      <div
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 blur-sm"
        style={{
          top: `${(animateWave / 30) * 100}%`,
          transition: 'top 0.15s linear'
        }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Target className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Zone Risk Heat Matrix
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-md border border-blue-500/30 animate-pulse">
                Live
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time zone risk visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded shadow-lg shadow-green-500/50 animate-pulse" />
            <span className="text-slate-400 font-medium">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-amber-500 rounded shadow-lg shadow-amber-500/50 animate-pulse" />
            <span className="text-slate-400 font-medium">Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded shadow-lg shadow-red-500/50 animate-pulse" />
            <span className="text-slate-400 font-medium">High</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2 relative z-10 mb-6">
        {state.zones.map((zone, zoneIdx) => (
          <React.Fragment key={zone.id}>
            {Array.from({ length: 10 }).map((_, idx) => {
              const cellId = `${zoneIdx}-${idx}`;
              const intensity = getRiskIntensity(zone.aggregatedRisk);
              const isActive = idx < intensity;
              const isHovered = hoveredCell === cellId;

              let color = '#1e293b';
              let glowColor = 'rgba(30, 41, 59, 0)';

              if (isActive) {
                if (zone.aggregatedRisk >= 0.70) {
                  color = '#ef4444';
                  glowColor = 'rgba(239, 68, 68, 0.6)';
                } else if (zone.aggregatedRisk >= 0.40) {
                  color = '#f59e0b';
                  glowColor = 'rgba(245, 158, 11, 0.6)';
                } else {
                  color = '#10b981';
                  glowColor = 'rgba(16, 185, 129, 0.6)';
                }
              }

              return (
                <div
                  key={cellId}
                  className="aspect-square rounded-md cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    opacity: isActive ? (isHovered ? 1 : 0.85) : 0.15,
                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: isHovered ? `0 0 25px ${glowColor}, 0 0 40px ${glowColor}` : 'none',
                    zIndex: isHovered ? 10 : 1
                  }}
                  onMouseEnter={() => setHoveredCell(cellId)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => actions.selectZone(zone.id)}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 relative z-10">
        {state.zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => actions.selectZone(zone.id)}
            className={`relative p-4 rounded-lg transition-all duration-300 group/btn ${state.ui.selectedZone === zone.id
              ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/50 shadow-lg shadow-blue-500/20'
              : 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
              }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity rounded-lg" />
            <div className="relative">
              <p className="text-xs text-slate-400 mb-1 font-medium">{zone.name}</p>
              <p className="text-2xl font-bold text-slate-100 mb-1">{zone.aggregatedRisk.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Eye className="w-3 h-3" />
                <span>{zone.cameraIds.length} cameras</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ENHANCED 3D ZONE VISUALIZATION
// ============================================================================

const Zone3DVisualization = () => {
  const { state, actions } = useGlobalState();
  const [selectedZone, setSelectedZone] = useState(null);

  const getZoneHeight = (risk) => 80 + (risk * 160);

  const getZoneColor = (risk) => {
    if (risk >= 0.70) return {
      base: '#ef4444',
      glow: '#ef444480',
      gradient: 'from-red-600 via-red-500 to-red-400',
      shadow: 'rgba(239, 68, 68, 0.5)'
    };
    if (risk >= 0.40) return {
      base: '#f59e0b',
      glow: '#f59e0b80',
      gradient: 'from-amber-600 via-amber-500 to-amber-400',
      shadow: 'rgba(245, 158, 11, 0.5)'
    };
    return {
      base: '#10b981',
      glow: '#10b98180',
      gradient: 'from-green-600 via-green-500 to-green-400',
      shadow: 'rgba(16, 185, 129, 0.5)'
    };
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
            animation: 'grid-slide 20s linear infinite'
          }}
        />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              3D Risk Levels
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Interactive zone visualization</p>
          </div>
        </div>
        <Radio className="w-4 h-4 text-green-400 animate-ping" />
      </div>

      <div className="relative h-80 flex items-end justify-around gap-8 px-8">
        {state.zones.map((zone) => {
          const height = getZoneHeight(zone.aggregatedRisk);
          const colors = getZoneColor(zone.aggregatedRisk);
          const isSelected = selectedZone === zone.id || state.ui.selectedZone === zone.id;

          return (
            <div
              key={zone.id}
              className="relative flex-1 cursor-pointer group/bar"
              onClick={() => {
                setSelectedZone(zone.id);
                actions.selectZone(zone.id);
              }}
              onMouseEnter={() => setSelectedZone(zone.id)}
              onMouseLeave={() => setSelectedZone(null)}
            >
              {/* Hover glow */}
              {isSelected && (
                <div
                  className="absolute -inset-4 rounded-xl animate-pulse"
                  style={{
                    background: `radial-gradient(circle, ${colors.shadow} 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* 3D Bar */}
              <div
                className={`relative w-full rounded-t-2xl transition-all duration-700 overflow-hidden ${isSelected ? 'scale-110' : 'scale-100'
                  }`}
                style={{
                  height: `${height}px`,
                  background: `linear-gradient(to top, ${colors.base}dd, ${colors.base}, ${colors.base}ee)`,
                  boxShadow: `
                    0 10px 40px ${colors.shadow},
                    0 0 60px ${colors.glow},
                    inset 0 -30px 40px rgba(0,0,0,0.4),
                    inset 0 3px 15px rgba(255,255,255,0.3)
                  `,
                  transform: 'perspective(700px) rotateX(5deg)',
                }}
              >
                {/* Animated shine */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, transparent 30%, white 50%, transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'shine-move 4s infinite'
                  }}
                />

                {/* Scan lines */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)',
                    animation: 'scan-move 2s linear infinite'
                  }}
                />

                {/* Value display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                  <div className="text-5xl font-bold mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                    {zone.aggregatedRisk.toFixed(2)}
                  </div>
                  <div className="text-xs opacity-90 uppercase tracking-wider font-semibold">Risk Level</div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs opacity-80 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" />
                    {zone.cameraIds.length} active
                  </div>
                </div>

                {/* Pulse rings */}
                <div className="absolute inset-0 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  <div
                    className="absolute inset-0 border-3 rounded-t-2xl"
                    style={{
                      borderColor: colors.base,
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}
                  />
                </div>
              </div>

              {/* Base platform with glow */}
              <div
                className="h-4 bg-slate-800 border-3 rounded-b-xl transition-all"
                style={{
                  borderColor: isSelected ? colors.base : '#475569',
                  boxShadow: isSelected ? `0 0 30px ${colors.shadow}, 0 5px 15px ${colors.shadow}` : '0 2px 4px rgba(0,0,0,0.3)'
                }}
              />

              {/* Zone info */}
              <div className="text-center mt-4 space-y-2">
                <p className="text-sm font-bold text-slate-200">{zone.name}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="font-medium">{zone.cameraIds.length} cameras</span>
                  <span>•</span>
                  <span className={`font-semibold px-2 py-0.5 rounded ${zone.status === 'high_risk' ? 'bg-red-900/30 text-red-400 border border-red-800/50' :
                      zone.status === 'suspicious' ? 'bg-amber-900/30 text-amber-400 border border-amber-800/50' :
                        'bg-green-900/30 text-green-400 border border-green-800/50'
                    }`}>
                    {zone.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes shine-move {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
        @keyframes scan-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes grid-slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// ENHANCED SYSTEM KPIS
// ============================================================================

const SystemKPIs = () => {
  const { state } = useGlobalState();
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      icon: Shield,
      label: 'Active Zones',
      value: state.zones.filter(z => z.status !== 'normal').length,
      total: state.zones.length,
      color: 'text-blue-400',
      bg: 'from-blue-950/40 to-blue-900/20',
      border: 'border-blue-900/50',
      accentColor: '#3b82f6',
      iconBg: 'bg-blue-500/20'
    },
    {
      icon: AlertTriangle,
      label: 'High Risk Cameras',
      value: state.cameras.filter(c => c.status === 'high_risk').length,
      total: state.cameras.length,
      color: 'text-red-400',
      bg: 'from-red-950/40 to-red-900/20',
      border: 'border-red-900/50',
      accentColor: '#ef4444',
      iconBg: 'bg-red-500/20'
    },
    {
      icon: Activity,
      label: 'Active Alerts',
      value: state.system.activeAlerts,
      total: state.alerts.length,
      color: 'text-amber-400',
      bg: 'from-amber-950/40 to-amber-900/20',
      border: 'border-amber-900/50',
      accentColor: '#f59e0b',
      iconBg: 'bg-amber-500/20'
    },
    {
      icon: Zap,
      label: 'Avg System Risk',
      value: (state.cameras.reduce((sum, c) => sum + c.riskScore, 0) / state.cameras.length).toFixed(2),
      total: '1.00',
      color: 'text-green-400',
      bg: 'from-green-950/40 to-green-900/20',
      border: 'border-green-900/50',
      accentColor: '#10b981',
      iconBg: 'bg-green-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isPulsing = pulseIndex === idx;
        const percentage = (parseFloat(kpi.value) / parseFloat(kpi.total)) * 100;

        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${kpi.bg} border ${kpi.border} rounded-xl p-5 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl`}
            style={{
              boxShadow: isPulsing ? `0 0 40px ${kpi.accentColor}40, 0 10px 30px rgba(0,0,0,0.3)` : '0 4px 6px rgba(0,0,0,0.2)'
            }}
          >
            {/* Animated gradient background */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, ${kpi.accentColor}15 0%, transparent 100%)`
              }}
            />

            {/* Scan line */}
            <div
              className="absolute inset-x-0 h-px opacity-0 group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${kpi.accentColor}, transparent)`,
                animation: 'scan-horizontal 2s linear infinite'
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className={`w-12 h-12 ${kpi.iconBg} rounded-xl flex items-center justify-center border border-${kpi.color.replace('text-', '')}-800/50 shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  {isPulsing && (
                    <>
                      <div
                        className="absolute inset-0 rounded-xl animate-ping"
                        style={{ backgroundColor: kpi.accentColor, opacity: 0.3 }}
                      />
                      <div
                        className="absolute inset-0 rounded-xl animate-pulse"
                        style={{ backgroundColor: kpi.accentColor, opacity: 0.2 }}
                      />
                    </>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${kpi.color.replace('text', 'bg')} animate-pulse`}
                    style={{ boxShadow: `0 0 12px ${kpi.accentColor}` }}
                  />
                  <Maximize2 className={`w-4 h-4 ${kpi.color} opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110`} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-slate-100 transition-all group-hover:scale-110">
                    {kpi.value}
                  </p>
                  <span className="text-xl text-slate-500 font-semibold">/{kpi.total}</span>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {kpi.label}
                </p>
              </div>

              {/* Enhanced progress bar */}
              <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: kpi.accentColor
                  }}
                >
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes scan-horizontal {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// ENHANCED RISK PERSISTENCE TIMELINE
// ============================================================================

const RiskPersistenceTimeline = () => {
  const { state } = useGlobalState();
  const [expandedZone, setExpandedZone] = useState(null);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all relative overflow-hidden shadow-xl">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Risk Persistence Timeline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Historical risk tracking</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {state.zones.map(zone => {
          const isExpanded = expandedZone === zone.id;

          return (
            <div
              key={zone.id}
              className="space-y-2.5 cursor-pointer group/timeline"
              onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-2 group-hover/timeline:text-blue-400 transition-colors">
                  {zone.name}
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                </span>
                <span className="text-slate-400 font-mono text-sm font-bold">{zone.aggregatedRisk.toFixed(2)}</span>
              </div>

              <div className="relative h-12 bg-slate-800/50 rounded-xl overflow-hidden hover:shadow-lg transition-all border border-slate-700/50 group-hover/timeline:border-slate-600">
                {/* Animated risk bar */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 overflow-hidden"
                  style={{
                    width: `${(zone.aggregatedRisk * 100)}%`,
                    background: zone.aggregatedRisk >= 0.70
                      ? 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c, #dc2626, #ef4444)'
                      : zone.aggregatedRisk >= 0.40
                        ? 'linear-gradient(90deg, #f59e0b, #d97706, #b45309, #d97706, #f59e0b)'
                        : 'linear-gradient(90deg, #10b981, #059669, #047857, #059669, #10b981)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient-shift 3s ease infinite'
                  }}
                >
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </div>
                {/* Pulse effect */}
                {zone.aggregatedRisk > 0.40 && (
                  <div
                    className="absolute inset-y-0 right-0 w-3 animate-pulse"
                    style={{
                      background: zone.aggregatedRisk >= 0.70 ? '#ef4444' : '#f59e0b',
                      boxShadow: `0 0 20px ${zone.aggregatedRisk >= 0.70 ? '#ef4444' : '#f59e0b'}`
                    }}
                  />
                )}

                {/* Camera count overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-sm font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] px-3 py-1 rounded-md bg-black/20 backdrop-blur-sm">
                    {zone.cameraIds.length} cameras • {((zone.aggregatedRisk * 100).toFixed(0))}% risk
                  </span>
                </div>

                {/* Scan line effect */}
                {isExpanded && (
                  <div
                    className="absolute inset-y-0 left-0 w-1 bg-white/60 shadow-lg"
                    style={{
                      animation: 'scan-bar 2s linear infinite'
                    }}
                  />
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 p-4 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-lg border border-slate-700 space-y-3 animate-fadeIn backdrop-blur-sm shadow-inner">
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-500 mb-1.5 font-medium">Status</p>
                      <p className={`font-bold text-sm ${zone.status === 'high_risk' ? 'text-red-400' :
                          zone.status === 'suspicious' ? 'text-amber-400' : 'text-green-400'
                        }`}>
                        {zone.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-500 mb-1.5 font-medium">Cameras</p>
                      <p className="font-bold text-sm text-slate-200">{zone.cameraIds.join(', ')}</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-500 mb-1.5 font-medium">Zone ID</p>
                      <p className="font-bold text-sm text-slate-200 font-mono">{zone.id}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 50%; }
          100% { background-position: -200% 50%; }
        }
        @keyframes scan-bar {
          0% { left: 0; }
          100% { left: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// ENHANCED EVENT TABLE
// ============================================================================

const EventAggregationTable = () => {
  const { state } = useGlobalState();
  const [filter, setFilter] = useState('all');
  const recentEvents = state.eventTimeline
    .filter(e => filter === 'all' || e.entityType === filter)
    .slice(0, 10);

  const getEventColor = (action) => {
    if (action.includes('Alert Generated')) return {
      text: 'text-red-400',
      bg: 'from-red-950/40 to-red-900/20',
      border: 'border-red-900/50',
      icon: AlertTriangle
    };
    if (action.includes('Alert Resolved')) return {
      text: 'text-green-400',
      bg: 'from-green-950/40 to-green-900/20',
      border: 'border-green-900/50',
      icon: Shield
    };
    if (action.includes('Risk')) return {
      text: 'text-amber-400',
      bg: 'from-amber-950/40 to-amber-900/20',
      border: 'border-amber-900/50',
      icon: TrendingUp
    };
    return {
      text: 'text-blue-400',
      bg: 'from-blue-950/40 to-blue-900/20',
      border: 'border-blue-900/50',
      icon: Activity
    };
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 hover:border-blue-500/50 transition-all relative overflow-hidden shadow-xl">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Recent System Events
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-md border border-emerald-500/30">
                {recentEvents.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest activity feed</p>
          </div>
        </div>
        {/* Filter buttons */}
        <div className="flex gap-1.5">
          {['all', 'alert', 'camera', 'zone'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all font-medium ${filter === f
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 border border-slate-700/50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar">
        {recentEvents.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <Clock className="w-8 h-8 opacity-30" />
            </div>
            <p className="text-sm font-medium mb-1">No events recorded yet</p>
            <p className="text-xs text-slate-600">Events will appear here as they occur</p>
          </div>
        ) : (
          recentEvents.map((event, idx) => {
            const eventStyle = getEventColor(event.systemAction);
            const EventIcon = eventStyle.icon;

            return (
              <div
                key={event.id}
                className={`bg-gradient-to-r ${eventStyle.bg} rounded-xl p-4 border ${eventStyle.border} hover:border-slate-600 transition-all group hover:scale-[1.02] cursor-pointer shadow-lg hover:shadow-xl`}
                style={{
                  animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${eventStyle.bg} border ${eventStyle.border} shadow-lg`}>
                    <EventIcon className={`w-5 h-5 ${eventStyle.text}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${eventStyle.text} mb-1.5 flex items-center gap-2`}>
                      {event.systemAction}
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-1">{event.details}</p>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-2">
                    <p className="text-xs text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                    <span className={`inline-block px-2.5 py-0.5 ${eventStyle.bg} ${eventStyle.text} text-xs rounded-md border ${eventStyle.border} font-semibold`}>
                      {event.entityType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN PAGE 2 COMPONENT
// ============================================================================

const Page2_AreaRiskView = () => {
  const { state } = useGlobalState();
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>
      {/* Mode Watermark */}
      {state.system.mode === 'SIMULATION' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
          <p className="text-9xl font-black text-blue-500 transform -rotate-45">
            SIMULATION MODE
          </p>
        </div>
      )}

      <Header currentPage="Area Risk View" />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        <div className="max-w-[1900px] mx-auto space-y-6">
          {/* KPIs Section */}
          <SystemKPIs />

          {/* Main Visualizations Row */}
          <div className="grid grid-cols-2 gap-6">
            <Zone3DVisualization />
            <ZoneRiskHeatmap />
          </div>

          {/* Timeline and Events Row */}
          <div className="grid grid-cols-2 gap-6">
            <RiskPersistenceTimeline />
            <EventAggregationTable />
          </div>
        </div>
      </div>

      <SimulationControls />
    </div>
  );
};

export default Page2_AreaRiskView;
