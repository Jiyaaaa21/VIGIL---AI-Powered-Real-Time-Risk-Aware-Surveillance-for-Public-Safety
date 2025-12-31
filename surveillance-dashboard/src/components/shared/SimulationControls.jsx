import React, { useState } from 'react';
import { Activity, Play, Pause, RotateCcw, Download, AlertTriangle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateContext';
import useSimulation from '../../hooks/useSimulation';

const SimulationControls = () => {
  const { state, actions } = useGlobalState();
  const simulation = useSimulation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(null);

  const handleOverrideAction = (action, actionName) => {
    setShowConfirmation({ action, actionName });
  };

  const executeOverride = () => {
    if (showConfirmation) {
      showConfirmation.action();
      setShowConfirmation(null);
    }
  };

  const toggleExpanded = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-80 z-50">
        {/* Compact Header */}
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-750 transition-colors rounded-t-lg"
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-slate-300 font-semibold tracking-wide">
              SIMULATION CONTROL
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${simulation.isRunning ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Compact Status Bar - Always Visible */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Status:</span>
              <span className={`font-semibold ${simulation.isRunning ? 'text-green-400' : 'text-amber-400'}`}>
                {simulation.isRunning ? 'RUNNING' : 'PAUSED'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Time:</span>
              <span className="text-slate-200 font-mono">{simulation.elapsedTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Speed:</span>
              <span className="text-blue-400 font-mono font-semibold">{simulation.speed}x</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-1.5 transition-all duration-300"
              style={{ width: `${simulation.progress}%` }}
            />
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-slate-700 p-3 space-y-3 rounded-b-lg">
            {/* Simulation Controls Section */}
            <div className="bg-slate-900/50 rounded-lg p-3 border border-blue-900/30">
              <p className="text-xs text-blue-400 mb-2 font-semibold uppercase tracking-wide">🧪 Simulation Controls</p>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulation.toggleRunning();
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded font-semibold text-xs transition-all ${
                    simulation.isRunning 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {simulation.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Resume
                    </>
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    simulation.reset();
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-xs text-white transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              {/* Speed Control */}
              <div>
                <p className="text-xs text-slate-400 mb-1.5 font-medium">Playback Speed</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 5].map(s => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation();
                        simulation.setSpeed(s);
                      }}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        simulation.speed === s
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Overrides Section */}
            <div className="bg-red-950/20 rounded-lg p-3 border border-red-900/30">
              <p className="text-xs text-red-400 mb-2 font-semibold uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ⚠ Manual Overrides
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOverrideAction(
                      () => actions.updateCameraRisk('CAM_04', 0.85, 0.92),
                      'Force CAM_04 to High Risk'
                    );
                  }}
                  className="px-3 py-2 bg-red-600/80 hover:bg-red-600 rounded text-xs text-white font-semibold transition-all border border-red-700"
                >
                  Force CAM_04 High Risk
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOverrideAction(
                      () => actions.generateAlert('CAM_04', 0.85, 0.92, 'Manual alert test'),
                      'Generate Test Alert'
                    );
                  }}
                  className="px-3 py-2 bg-red-700/80 hover:bg-red-700 rounded text-xs text-white font-semibold transition-all border border-red-800"
                >
                  Force Alert Generation
                </button>
              </div>
            </div>

            {/* Export Section */}
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  actions.downloadLogs();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white font-semibold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download Logs CSV
              </button>
            </div>

            {/* Stats Footer */}
            <div className="border-t border-slate-700 pt-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Logs:</span>
                  <span className="text-slate-200 font-semibold font-mono">{state.logs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Events:</span>
                  <span className="text-slate-200 font-semibold font-mono">{state.eventTimeline.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cameras:</span>
                  <span className="text-slate-200 font-semibold font-mono">9/9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alerts:</span>
                  <span className={`font-semibold font-mono ${state.system.activeAlerts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {state.system.activeAlerts}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={() => setShowConfirmation(null)}
        >
          <div 
            className="bg-slate-800 border-2 border-red-600 rounded-lg p-6 max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">Confirm Override Action</h3>
                <p className="text-sm text-slate-300">
                  You are about to execute:
                </p>
                <p className="text-sm font-semibold text-red-400 mt-2">
                  {showConfirmation.actionName}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  This will override the current simulation state.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  executeOverride();
                }}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-sm transition-all"
              >
                Confirm
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmation(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimulationControls;