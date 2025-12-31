import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, Clock } from 'lucide-react';
import { useGlobalState } from '../../context/GlobalStateContext';

const Header = ({ currentPage = 'Camera Risk View' }) => {
  const { state } = useGlobalState();
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const navItems = [
    { path: '/cameras', label: 'Cameras' },
    { path: '/areas', label: 'Areas' },
    { path: '/timeline', label: 'Timeline' },
    { path: '/system', label: 'System' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 sticky top-0 z-40 flex-shrink-0">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                AI SURVEILLANCE SYSTEM
              </h1>
              <p className="text-xs text-slate-400">
                {currentPage}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
                location.pathname === item.path
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Status Indicators */}
        <div className="flex items-center gap-3">
          {/* System Mode Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-800/50 rounded text-xs font-semibold text-blue-200">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            {state.system.mode}
          </div>

          {/* Active Alerts Badge */}
          {state.system.activeAlerts > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-800/50 rounded text-xs font-semibold text-red-200">
              <AlertCircle className="w-3.5 h-3.5" />
              {state.system.activeAlerts} Alert{state.system.activeAlerts > 1 ? 's' : ''}
            </div>
          )}

          {/* System Health Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold border ${
            state.system.healthStatus === 'OPERATIONAL'
              ? 'bg-green-900/30 border-green-800/50 text-green-200'
              : 'bg-amber-900/30 border-amber-800/50 text-amber-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              state.system.healthStatus === 'OPERATIONAL' ? 'bg-green-400' : 'bg-amber-400'
            }`} />
            {state.system.healthStatus}
          </div>

          {/* Clock */}
          <div className="hidden lg:flex flex-col items-end text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(currentTime)}
            </div>
            <div className="text-slate-500 text-xs">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;