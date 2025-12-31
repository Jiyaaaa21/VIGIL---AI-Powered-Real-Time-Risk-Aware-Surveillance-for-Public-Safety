import React, { useState, useEffect } from 'react';
import Header from '../shared/Header';
import SimulationControls from '../shared/SimulationControls';
import { useGlobalState } from '../../context/GlobalStateContext';
import { Shield, Activity, Server, Download, CheckCircle, Clock, Cpu, HardDrive, Wifi, AlertTriangle, TrendingUp } from 'lucide-react';

const Page4_SystemHealth = () => {
  const { state, actions } = useGlobalState();
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [networkUsage, setNetworkUsage] = useState(38);

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(40, Math.min(85, prev + (Math.random() - 0.5) * 8)));
      setNetworkUsage(prev => Math.max(15, Math.min(75, prev + (Math.random() - 0.5) * 12)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Calculate system uptime
  const uptimeMinutes = Math.floor((Date.now() - new Date(state.system.lastUpdate).getTime()) / 60000);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);

  const camerasOnline = state.cameras.filter(c => c.status !== 'offline').length;
  const cameraPercentage = (camerasOnline / state.cameras.length) * 100;

  const getHealthColor = (status) => {
    if (status === 'Healthy' || status === 'operational') return 'text-green-400';
    if (status === 'Warning') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMetricColor = (value) => {
    if (value < 50) return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
    if (value < 75) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      <Header currentPage="System Health" />

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Title with Animation */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-lg shadow-green-500/20">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              System Health & Readiness
            </h1>
            <p className="text-slate-400">Infrastructure reliability and operational status</p>
          </div>

          {/* Primary Status Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Cameras Online */}
            <div className="bg-gradient-to-br from-green-950/40 to-green-900/20 border border-green-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-green-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-green-300 font-medium">Cameras</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-3xl font-bold text-green-400 mb-1">
                {camerasOnline}/{state.cameras.length}
              </p>
              <div className="mt-2 h-2 bg-green-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                  style={{ width: `${cameraPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-green-300 mt-2">All operational</p>
            </div>

            {/* Active Alerts */}
            <div className={`bg-gradient-to-br ${state.system.activeAlerts > 0 ? 'from-red-950/40 to-red-900/20 border-red-900/50' : 'from-slate-900 to-slate-800 border-slate-700'} border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 ${state.system.activeAlerts > 0 ? 'bg-red-500/20' : 'bg-slate-700/50'} rounded-lg flex items-center justify-center`}>
                    <AlertTriangle className={`w-5 h-5 ${state.system.activeAlerts > 0 ? 'text-red-400' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-xs font-medium ${state.system.activeAlerts > 0 ? 'text-red-300' : 'text-slate-400'}`}>Active Alerts</p>
                </div>
                {state.system.activeAlerts > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>
              <p className={`text-3xl font-bold mb-1 ${state.system.activeAlerts > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                {state.system.activeAlerts}
              </p>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                  style={{ width: state.system.activeAlerts > 0 ? '100%' : '0%' }}
                ></div>
              </div>
              <p className={`text-xs mt-2 ${state.system.activeAlerts === 0 ? 'text-green-400' : 'text-red-300'}`}>
                {state.system.activeAlerts === 0 ? 'No alerts' : 'Monitoring'}
              </p>
            </div>

            {/* System Mode */}
            <div className="bg-gradient-to-br from-blue-950/40 to-blue-900/20 border border-blue-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs text-blue-300 font-medium">System Mode</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-1 uppercase">
                {state.system.mode}
              </p>
              <div className="mt-2 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-full"></div>
              </div>
              <p className="text-xs text-blue-300 mt-2">Running</p>
            </div>

            {/* Health Status */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-900/50 rounded-xl p-4 shadow-lg hover:shadow-xl hover:shadow-emerald-500/10 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-emerald-300 font-medium">Health</p>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className={`text-2xl font-bold mb-1 uppercase ${getHealthColor(state.system.healthStatus)}`}>
                {state.system.healthStatus}
              </p>
              <div className="mt-2 h-2 bg-emerald-900/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 w-full"></div>
              </div>
              <p className="text-xs text-emerald-300 mt-2">All systems go</p>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-3 gap-4">
            {/* CPU Usage */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 ${getMetricColor(cpuUsage).bg}/20 rounded-lg flex items-center justify-center`}>
                    <Cpu className={`w-5 h-5 ${getMetricColor(cpuUsage).text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">CPU Usage</p>
                    <p className={`text-2xl font-bold ${getMetricColor(cpuUsage).text}`}>
                      {cpuUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${getMetricColor(cpuUsage).bg} transition-all duration-500`}
                  style={{ width: `${cpuUsage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 ${getMetricColor(memoryUsage).bg}/20 rounded-lg flex items-center justify-center`}>
                    <HardDrive className={`w-5 h-5 ${getMetricColor(memoryUsage).text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Memory Usage</p>
                    <p className={`text-2xl font-bold ${getMetricColor(memoryUsage).text}`}>
                      {memoryUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${getMetricColor(memoryUsage).bg} transition-all duration-500`}
                  style={{ width: `${memoryUsage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Network Usage */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 ${getMetricColor(networkUsage).bg}/20 rounded-lg flex items-center justify-center`}>
                    <Wifi className={`w-5 h-5 ${getMetricColor(networkUsage).text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Network</p>
                    <p className={`text-2xl font-bold ${getMetricColor(networkUsage).text}`}>
                      {networkUsage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${getMetricColor(networkUsage).bg} transition-all duration-500`}
                  style={{ width: `${networkUsage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* System Uptime & Stats */}
          <div className="grid grid-cols-2 gap-4">
            {/* Uptime */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">System Uptime</h3>
                  <p className="text-xs text-slate-400">Continuous operation time</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{uptimeDays}</p>
                  <p className="text-xs text-slate-400 mt-1">Days</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{uptimeHours % 24}</p>
                  <p className="text-xs text-slate-400 mt-1">Hours</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-400">{uptimeMinutes % 60}</p>
                  <p className="text-xs text-slate-400 mt-1">Minutes</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Performance Stats</h3>
                  <p className="text-xs text-slate-400">System throughput metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Avg Response</p>
                  <p className="text-xl font-bold text-blue-400">45ms</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Requests/sec</p>
                  <p className="text-xl font-bold text-blue-400">1.2K</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Success Rate</p>
                  <p className="text-xl font-bold text-blue-400">99.8%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logs Download Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">System Logs Export</h3>
                    <p className="text-xs text-slate-400">Download complete audit trail</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Export all system logs in CSV format for comprehensive audit and analysis. 
                  Includes risk changes, alerts, zone updates, and system events.
                </p>
                
                {/* Log Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Total Log Entries</p>
                    <p className="text-2xl font-bold text-slate-200 font-mono">{state.logs.length}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Timeline Events</p>
                    <p className="text-2xl font-bold text-slate-200 font-mono">{state.eventTimeline.length}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Total Alerts</p>
                    <p className="text-2xl font-bold text-slate-200 font-mono">{state.alerts.length}</p>
                  </div>
                </div>

                <button
                  onClick={actions.downloadLogs}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-900/50 hover:scale-105"
                >
                  <Download className="w-5 h-5" />
                  Download Logs CSV
                </button>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">System Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Snapshot Refresh Rate:</span>
                <span className="text-slate-200 font-bold font-mono text-lg">{state.system.snapshotRefreshRate / 1000}s</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Total Cameras:</span>
                <span className="text-slate-200 font-bold font-mono text-lg">9</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Total Zones:</span>
                <span className="text-slate-200 font-bold font-mono text-lg">3</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-sm">Alert Threshold:</span>
                <span className="text-slate-200 font-bold font-mono text-lg">3 frames</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Additional Features (Coming Soon)</h3>
            <ul className="grid grid-cols-2 gap-3">
              <li className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Camera connectivity monitoring</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Processing latency metrics</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">System resource utilization (CPU, Memory, Network)</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Heartbeat monitoring and failover status</span>
              </li>
              <li className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg col-span-2">
                <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Historical uptime statistics</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-slate-700 mt-4">
              <p className="text-sm text-slate-500 italic">
                This page demonstrates infrastructure-grade reliability monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      <SimulationControls />
    </div>
  );
};

export default Page4_SystemHealth;