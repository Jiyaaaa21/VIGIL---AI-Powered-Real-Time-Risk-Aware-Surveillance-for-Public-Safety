import React, { useState, useMemo } from 'react';
import Header from '../shared/Header';
import SimulationControls from '../shared/SimulationControls';
import { useGlobalState } from '../../context/GlobalStateContext';
import { formatTimestamp } from '../../utils/constants';

const Page3_EventTimeline = () => {
  const { state } = useGlobalState();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCamera, setFilterCamera] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest'); // newest or oldest

  // Get all events from timeline and alerts
  const allEvents = useMemo(() => {
    const events = [];
    
    // Add timeline events
    if (state?.eventTimeline && Array.isArray(state.eventTimeline)) {
      state.eventTimeline.forEach(event => {
        events.push({
          id: event.id,
          timestamp: event.timestamp,
          type: event.entityType || 'system',
          entityId: event.entityId || 'SYSTEM',
          action: event.systemAction || 'Event',
          details: event.details || 'No details',
          source: 'timeline'
        });
      });
    }
    
    // Add alert events
    if (state?.alerts && Array.isArray(state.alerts)) {
      state.alerts.forEach(alert => {
        const camera = state?.cameras?.find(c => c.id === alert.cameraId);
        const riskScore = typeof alert.riskScore === 'number' ? alert.riskScore : parseFloat(alert.riskScore) || 0;
        events.push({
          id: `alert-${alert.id}`,
          timestamp: alert.timestamp,
          type: 'alert',
          entityId: alert.cameraId,
          action: alert.status === 'active' ? 'Alert Generated' : 'Alert Resolved',
          details: `${alert.cameraId} - ${alert.description} (Risk: ${riskScore.toFixed(2)})`,
          status: alert.status,
          riskScore: riskScore,
          zone: camera?.zone,
          source: 'alert'
        });
      });
    }
    
    // Add camera risk changes from logs
    if (state?.logs && Array.isArray(state.logs)) {
      state.logs.forEach(log => {
        if (log.eventType === 'risk_change' || log.eventType === 'zone_risk_change') {
          const camera = state?.cameras?.find(c => c.id === log.entityId);
          const riskScore = typeof log.riskScore === 'number' ? log.riskScore : parseFloat(log.riskScore);
          events.push({
            id: `log-${log.id}`,
            timestamp: log.timestamp,
            type: log.entityType || 'camera',
            entityId: log.entityId,
            action: log.eventType === 'risk_change' ? 'Risk Change' : 'Zone Risk Change',
            details: log.description || 'Risk updated',
            riskScore: riskScore,
            status: log.currentStatus,
            zone: camera?.zone,
            source: 'log'
          });
        }
      });
    }
    
    // Sort by timestamp
    return events.sort((a, b) => 
      sortOrder === 'newest' 
        ? new Date(b.timestamp) - new Date(a.timestamp)
        : new Date(a.timestamp) - new Date(b.timestamp)
    );
  }, [state?.eventTimeline, state?.alerts, state?.logs, state?.cameras, sortOrder]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = searchQuery === '' ||
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.entityId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesCamera = filterCamera === 'all' || event.entityId === filterCamera;
      const matchesZone = filterZone === 'all' || event.zone === filterZone;
      
      return matchesSearch && matchesType && matchesCamera && matchesZone;
    });
  }, [allEvents, searchQuery, filterType, filterCamera, filterZone]);

  // Get unique event types
  const eventTypes = useMemo(() => {
    const types = new Set(allEvents.map(e => e.type));
    return Array.from(types);
  }, [allEvents]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalEvents = filteredEvents.length;
    const alertEvents = filteredEvents.filter(e => e.type === 'alert').length;
    const riskChanges = filteredEvents.filter(e => e.action === 'Risk Change').length;
    const systemEvents = filteredEvents.filter(e => e.type === 'system').length;
    
    return { totalEvents, alertEvents, riskChanges, systemEvents };
  }, [filteredEvents]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setFilterCamera('all');
    setFilterZone('all');
  };

  // Get event icon and color
  const getEventStyle = (event) => {
    switch (event.type) {
      case 'alert':
        return {
          icon: '🚨',
          iconBg: event.status === 'active' ? 'bg-red-500/20' : 'bg-slate-700/50',
          iconColor: event.status === 'active' ? 'text-red-400' : 'text-slate-400',
          bgColor: event.status === 'active' ? 'bg-gradient-to-r from-red-950/40 to-red-900/20' : 'bg-slate-800/50',
          borderColor: event.status === 'active' ? 'border-red-900/50 border-l-4 border-l-red-500' : 'border-slate-700 border-l-4 border-l-slate-600',
          textColor: event.status === 'active' ? 'text-red-300' : 'text-slate-400',
          badgeColor: event.status === 'active' ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-slate-700/50 text-slate-300 border border-slate-600',
          pulseColor: event.status === 'active' ? 'bg-red-500' : null
        };
      case 'camera':
        const riskScore = typeof event.riskScore === 'number' ? event.riskScore : parseFloat(event.riskScore) || 0;
        const riskLevel = riskScore >= 0.70 ? 'high' : riskScore >= 0.40 ? 'medium' : 'low';
        return {
          icon: '📹',
          iconBg: riskLevel === 'high' ? 'bg-orange-500/20' : riskLevel === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20',
          iconColor: riskLevel === 'high' ? 'text-orange-400' : riskLevel === 'medium' ? 'text-yellow-400' : 'text-blue-400',
          bgColor: riskLevel === 'high' ? 'bg-gradient-to-r from-orange-950/30 to-orange-900/10' : riskLevel === 'medium' ? 'bg-gradient-to-r from-yellow-950/30 to-yellow-900/10' : 'bg-slate-800/50',
          borderColor: riskLevel === 'high' ? 'border-orange-900/40 border-l-4 border-l-orange-500' : riskLevel === 'medium' ? 'border-yellow-900/40 border-l-4 border-l-yellow-500' : 'border-slate-700 border-l-4 border-l-blue-500',
          textColor: riskLevel === 'high' ? 'text-orange-300' : riskLevel === 'medium' ? 'text-yellow-300' : 'text-slate-300',
          badgeColor: 'bg-blue-900/50 text-blue-200 border border-blue-800',
          pulseColor: null
        };
      case 'zone':
        return {
          icon: '🗺️',
          iconBg: 'bg-purple-500/20',
          iconColor: 'text-purple-400',
          bgColor: 'bg-gradient-to-r from-purple-950/30 to-purple-900/10',
          borderColor: 'border-purple-900/40 border-l-4 border-l-purple-500',
          textColor: 'text-purple-300',
          badgeColor: 'bg-purple-900/50 text-purple-200 border border-purple-800',
          pulseColor: null
        };
      case 'system':
        return {
          icon: '⚙️',
          iconBg: 'bg-slate-700/50',
          iconColor: 'text-slate-400',
          bgColor: 'bg-slate-800/50',
          borderColor: 'border-slate-700 border-l-4 border-l-slate-500',
          textColor: 'text-slate-300',
          badgeColor: 'bg-gray-700/50 text-gray-200 border border-gray-600',
          pulseColor: null
        };
      default:
        return {
          icon: '📝',
          iconBg: 'bg-slate-700/50',
          iconColor: 'text-slate-400',
          bgColor: 'bg-slate-800/50',
          borderColor: 'border-slate-700 border-l-4 border-l-slate-500',
          textColor: 'text-slate-300',
          badgeColor: 'bg-slate-700/50 text-slate-300 border border-slate-600',
          pulseColor: null
        };
    }
  };

  const activeFilterCount = [
    searchQuery !== '',
    filterType !== 'all',
    filterCamera !== 'all',
    filterZone !== 'all'
  ].filter(Boolean).length;

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <Header currentPage="Event Timeline" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title with Animation */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Event Intelligence Timeline
            </h1>
            <p className="text-slate-400">Explainability and audit layer for system decisions</p>
          </div>

          {/* Stats Cards with Gradient Backgrounds */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Total Events</p>
                <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-200">{stats.totalEvents}</p>
              <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-950/40 to-red-900/20 border border-red-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-red-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-red-300 font-medium">Alerts</p>
                <div className="w-8 h-8 bg-red-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🚨</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-red-400">{stats.alertEvents}</p>
              <div className="mt-2 h-1 bg-red-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${Math.min(100, (stats.alertEvents / stats.totalEvents) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-950/40 to-yellow-900/20 border border-yellow-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-yellow-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-yellow-300 font-medium">Risk Changes</p>
                <div className="w-8 h-8 bg-yellow-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{stats.riskChanges}</p>
              <div className="mt-2 h-1 bg-yellow-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" style={{ width: `${Math.min(100, (stats.riskChanges / stats.totalEvents) * 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-blue-300 font-medium">System Events</p>
                <div className="w-8 h-8 bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.systemEvents}</p>
              <div className="mt-2 h-1 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400" style={{ width: `${Math.min(100, (stats.systemEvents / stats.totalEvents) * 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">Filters & Search</h3>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="text-xs bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-medium transition-colors border border-blue-500/30"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Search Events
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by action, details, or entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Event Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                >
                  <option value="all">All Types</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Zone
                </label>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                >
                  <option value="all">All Zones</option>
                  {(state?.zones || []).map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                Camera
              </label>
              <select
                value={filterCamera}
                onChange={(e) => setFilterCamera(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
              >
                <option value="all">All Cameras</option>
                {(state?.cameras || []).map(camera => (
                  <option key={camera.id} value={camera.id}>{camera.id} - {camera.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Enhanced Timeline */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">
                Event Timeline ({filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'})
              </h3>
              {filteredEvents.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Live tracking</span>
                </div>
              )}
            </div>

            {filteredEvents.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEvents.map((event, index) => {
                  const style = getEventStyle(event);
                  return (
                    <div
                      key={event.id}
                      className={`${style.bgColor} border ${style.borderColor} rounded-xl p-4 transition-all hover:shadow-lg hover:scale-[1.01] backdrop-blur-sm`}
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.3s ease-out forwards',
                        opacity: 0
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Enhanced Icon with Pulse Effect */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center border border-slate-600/50 shadow-lg`}>
                            <span className={`text-2xl ${style.iconColor}`}>{style.icon}</span>
                          </div>
                          {style.pulseColor && (
                            <div className={`absolute top-0 right-0 w-3 h-3 ${style.pulseColor} rounded-full animate-ping`}></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className={`font-semibold ${style.textColor} mb-1 text-base`}>
                                {event.action}
                              </h4>
                              <p className="text-sm text-slate-400 break-words leading-relaxed">
                                {event.details}
                              </p>
                            </div>
                            <span className={`flex-shrink-0 text-xs px-3 py-1 rounded-lg ${style.badgeColor} font-medium uppercase tracking-wide`}>
                              {event.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                            <span className="font-mono bg-slate-700/30 px-2 py-1 rounded">
                              {formatTimestamp(event.timestamp)}
                            </span>
                            <span className="bg-slate-700/30 px-2 py-1 rounded">
                              Entity: <span className="text-slate-300 font-medium">{event.entityId}</span>
                            </span>
                            {event.riskScore !== undefined && event.riskScore !== null && (
                              <span className="bg-slate-700/30 px-2 py-1 rounded">
                                Risk: <span className="text-slate-300 font-medium">{(typeof event.riskScore === 'number' ? event.riskScore : parseFloat(event.riskScore) || 0).toFixed(2)}</span>
                              </span>
                            )}
                            {event.zone && (
                              <span className="bg-slate-700/30 px-2 py-1 rounded">
                                Zone: <span className="text-slate-300 font-medium">{(state?.zones || []).find(z => z.id === event.zone)?.name || event.zone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-300 mb-2">No events found</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                  {allEvents.length === 0 
                    ? 'No events have been recorded yet. Start the simulation to generate events and see them appear here in real-time.' 
                    : 'No events match your current filters. Try adjusting your search criteria.'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SimulationControls />
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

export default Page3_EventTimeline;