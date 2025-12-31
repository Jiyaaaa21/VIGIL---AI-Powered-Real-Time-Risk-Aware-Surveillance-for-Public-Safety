import React, { useState } from 'react';
import Header from '../shared/Header';
import SimulationControls from '../shared/SimulationControls';
import ZoneMap from './ZoneMap';
import SystemGauges from './SystemGauges';
import ZoneStatusList from './ZoneStatusList';
import ActiveAlertsList from './ActiveAlertsList';
import CameraGrid from './CameraGrid';
import CameraModal from './CameraModal';
import { useGlobalState } from '../../context/GlobalStateContext';

const Page1_CameraRiskView = () => {
  const { state } = useGlobalState();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col relative">
      {/* Mode Watermark */}
      {state.system.mode === 'SIMULATION' && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
          <p className="text-9xl font-black text-blue-500 transform -rotate-45">
            SIMULATION MODE
          </p>
        </div>
      )}

      {/* Header */}
      <Header currentPage="Camera Risk View" />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Panel - Collapsible */}
        <aside 
          className={`bg-slate-900 border-r border-slate-800 overflow-y-auto flex-shrink-0 transition-all duration-300 ${
            sidebarCollapsed ? 'w-0' : 'w-80'
          }`}
        >
          <div className={`p-3 space-y-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <section>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Zone Overview
              </h3>
              <ZoneMap />
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                System Status
              </h3>
              <SystemGauges />
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Zone Status
              </h3>
              <ZoneStatusList />
            </section>

            <section>
              <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Active Alerts
              </h3>
              <ActiveAlertsList />
            </section>
          </div>
        </aside>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-r-lg p-2 transition-all duration-300 group"
          style={{ left: sidebarCollapsed ? '0' : '320px' }}
          title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
        >
          {sidebarCollapsed ? (
            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
        </button>

        {/* Right Panel - Camera Grid */}
        <main className="flex-1 p-4 overflow-y-auto bg-slate-950">
          <CameraGrid />
        </main>
      </div>

      {state.ui.modalCamera && <CameraModal />}
      <SimulationControls />
    </div>
  );
};

export default Page1_CameraRiskView;