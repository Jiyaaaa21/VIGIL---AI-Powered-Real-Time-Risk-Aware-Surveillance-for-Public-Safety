import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AlertCircle, Clock, Camera, TrendingUp, Activity, Zap, MapPin, Pause, Play } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateContext';
import { formatTimestamp, formatRiskScore } from '../../utils/constants';

const ActiveAlertsList = () => {
  const { state, actions } = useGlobalState();
  const [filterType, setFilterType] = useState('all'); // all, alerts, risk, system
  const [isPaused, setIsPaused] = useState(false);
  const [lastEventCount, setLastEventCount] = useState(0);
  const scrollRef = useRef(null);

  // Combine all events into activity feed
  const allEvents = useMemo(() => {
    const events = [];
    
    // Add active alerts
    state.alerts
      .filter(a => a.status === 'active')
      .forEach(alert => {
        const camera = state.cameras.find(c => c.id === alert.cameraId);
        const zone = state.zones.find(z => z.id === alert.zoneId);
        events.push({
          id: alert.id,
          type: 'alert',
          timestamp: alert.timestamp,
          cameraId: alert.cameraId,
          zoneName: zone?.name,
          title: alert.cameraId,
          description: alert.description,
          riskScore: alert.riskScore,
          confidence: alert.confidence,
          icon: AlertCircle,
          color: 'red',
          bgColor: 'bg-red-950/30',
          borderColor: 'border-red-900/50',
          textColor: 'text-red-300'
        });
      });
    
    // Add recent risk changes (from logs or simulated)
    state.cameras.forEach(camera => {
      if (camera.riskScore > 0.4) {
        const zone = state.zones.find(z => z.id === camera.zone);
        events.push({
          id: `risk-${camera.id}-${Date.now()}`,
          type: 'risk',
          timestamp: camera.lastUpdated,
          cameraId: camera.id,
          zoneName: zone?.name,
          title: camera.id,
          description: `Risk elevated to ${formatRiskScore(camera.riskScore)}`,
          riskScore: camera.riskScore,
          confidence: camera.confidence,
          icon: TrendingUp,
          color: camera.riskScore >= 0.7 ? 'red' : 'yellow',
          bgColor: camera.riskScore >= 0.7 ? 'bg-red-950/20' : 'bg-yellow-950/20',
          borderColor: camera.riskScore >= 0.7 ? 'border-red-900/30' : 'border-yellow-900/30',
          textColor: camera.riskScore >= 0.7 ? 'text-red-400' : 'text-yellow-400'
        });
      }
    });
    
    // Add system events (from timeline)
    state.eventTimeline.slice(0, 5).forEach(event => {
      events.push({
        id: event.id,
        type: 'system',
        timestamp: event.timestamp,
        cameraId: event.entityId,
        zoneName: null,
        title: event.systemAction,
        description: event.details,
        icon: Activity,
        color: 'blue',
        bgColor: 'bg-slate-800',
        borderColor: 'border-slate-700',
        textColor: 'text-slate-300'
      });
    });
    
    // Sort by timestamp (newest first)
    return events
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Show last 20 events
  }, [state.alerts, state.cameras, state.zones, state.eventTimeline]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allEvents;
    return allEvents.filter(e => e.type === filterType || (filterType === 'alerts' && e.type === 'alert'));
  }, [allEvents, filterType]);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (!isPaused && filteredEvents.length > lastEventCount) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0; // Scroll to top (newest)
      }
    }
    setLastEventCount(filteredEvents.length);
  }, [filteredEvents.length, isPaused, lastEventCount]);

  const handleEventClick = (event) => {
    if (event.cameraId && event.cameraId.startsWith('CAM_')) {
      actions.openCameraModal(event.cameraId);
    }
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="space-y-2">
        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('alerts')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === 'alerts' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alerts
            </button>
            <button
              onClick={() => setFilterType('risk')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === 'risk' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                filterType === 'system' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-8 h-8 text-slate-600" />
            <p className="text-slate-500 text-sm font-medium">No activity</p>
            <p className="text-slate-600 text-xs">
              {filterType === 'all' ? 'System monitoring normally' : `No ${filterType} events`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header with Filters and Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({allEvents.length})
          </button>
          <button
            onClick={() => setFilterType('alerts')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterType === 'alerts' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setFilterType('risk')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterType === 'risk' ? 'bg-yellow-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Risk
          </button>
          <button
            onClick={() => setFilterType('system')}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              filterType === 'system' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System
          </button>
        </div>

        {/* Pause/Play Control */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-1.5 rounded transition-colors ${
            isPaused ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      </div>

      {/* Activity Feed */}
      <div 
        ref={scrollRef}
        className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar"
      >
        {filteredEvents.map((event, index) => {
          const Icon = event.icon;
          const isNew = index === 0; // First item is newest

          return (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className={`${event.bgColor} border ${event.borderColor} rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all duration-200 group ${
                isNew && !isPaused ? 'animate-in slide-in-from-top-2 duration-300' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Event Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-4 h-4 ${event.textColor} group-hover:brightness-110 transition-colors`} />
                </div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  {/* Title and Zone */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-bold ${event.textColor} group-hover:brightness-110`}>
                      {event.title}
                    </h4>
                    {event.zoneName && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {event.zoneName}
                      </span>
                    )}
                    {isNew && !isPaused && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded font-medium animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className={`text-xs ${event.textColor} opacity-90 mb-2 leading-relaxed`}>
                    {event.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs">
                    {/* Time Ago */}
                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span className="font-mono">
                        {getTimeAgo(event.timestamp)}
                      </span>
                    </div>

                    {/* Risk Score (if available) */}
                    {event.riskScore !== undefined && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-slate-500" />
                        <span className={`font-bold font-mono ${event.textColor}`}>
                          {formatRiskScore(event.riskScore)}
                        </span>
                      </div>
                    )}

                    {/* Confidence (if available) */}
                    {event.confidence !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">Conf:</span>
                        <span className={`font-mono ${event.textColor}`}>
                          {(event.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Type Badge & Pulse */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {event.type === 'alert' && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase ${
                    event.type === 'alert' ? 'bg-red-900/50 text-red-300' :
                    event.type === 'risk' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-2">
        <span>Showing {filteredEvents.length} events</span>
        {isPaused && (
          <span className="flex items-center gap-1 text-yellow-400">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        )}
      </div>
    </div>
  );
};

export default ActiveAlertsList;