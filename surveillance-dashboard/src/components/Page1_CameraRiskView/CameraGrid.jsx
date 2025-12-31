import React, { useState, useMemo } from 'react';
import { useGlobalState } from '../../context/GlobalStateContext';
import CameraTile from './CameraTile';

const CameraGrid = () => {
  const { state } = useGlobalState();
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' (3 cols) or 'compact' (5 cols)
  const [showFilters, setShowFilters] = useState(false);

  // Filter cameras
  const filteredCameras = useMemo(() => {
    return state.cameras.filter(camera => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        camera.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        camera.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Zone filter
      const matchesZone = filterZone === 'all' || camera.zone === filterZone;
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || camera.status === filterStatus;
      
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [state.cameras, searchQuery, filterZone, filterStatus]);

  // Calculate active filter count
  const activeFilterCount = [
    searchQuery !== '',
    filterZone !== 'all',
    filterStatus !== 'all'
  ].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterZone('all');
    setFilterStatus('all');
  };

  // Get grid columns class
  const gridColsClass = viewMode === 'compact' ? 'grid-cols-5' : 'grid-cols-3';

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        {/* Top Row: Search & View Controls */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cameras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View (3 columns)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1"/>
                <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1"/>
                <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1"/>
                <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'compact' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact View (5 columns)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="10" y="3" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="17" y="3" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="3" y="10" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="10" y="10" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="17" y="10" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="3" y="17" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="10" y="17" width="4" height="4" strokeWidth="2" rx="1"/>
                <rect x="17" y="17" width="4" height="4" strokeWidth="2" rx="1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-300">Filter Options</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Zone Filter */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Zone
                </label>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Zones</option>
                  {state.zones.map(zone => (
                    <option key={zone.id} value={zone.id}>
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="normal">Normal</option>
                  <option value="suspicious">Suspicious</option>
                  <option value="high_risk">High Risk</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            Showing <span className="font-semibold text-slate-200">{filteredCameras.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{state.cameras.length}</span> cameras
          </div>
          
          {activeFilterCount > 0 && (
            <div className="text-blue-400 text-xs">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
            </div>
          )}
        </div>
      </div>

      {/* Camera Grid */}
      {filteredCameras.length > 0 ? (
        <div className={`grid ${gridColsClass} gap-3 auto-rows-fr`}>
          {filteredCameras.map(camera => (
            <CameraTile key={camera.id} camera={camera} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No cameras found</h3>
          <p className="text-sm text-slate-500 mb-4">
            Try adjusting your search or filter criteria
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CameraGrid;