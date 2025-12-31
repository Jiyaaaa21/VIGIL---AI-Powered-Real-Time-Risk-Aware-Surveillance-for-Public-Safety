import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';
import Page1_CameraRiskView from './components/Page1_CameraRiskView';
import Page2_AreaRiskView from './components/Page2_AreaRiskView';
import Page3_EventTimeline from './components/Page3_EventTimeline';
import Page4_SystemHealth from './components/Page4_SystemHealth';

function App() {
  return (
    <GlobalStateProvider>
      <Router>
        <Routes>
          {/* Default route - redirect to Page 1 */}
          <Route path="/" element={<Navigate to="/cameras" replace />} />
          
          {/* Page 1: Camera Risk View */}
          <Route path="/cameras" element={<Page1_CameraRiskView />} />
          
          {/* Page 2: Area Risk View */}
          <Route path="/areas" element={<Page2_AreaRiskView />} />
          
          {/* Page 3: Event Timeline */}
          <Route path="/timeline" element={<Page3_EventTimeline />} />
          
          {/* Page 4: System Health */}
          <Route path="/system" element={<Page4_SystemHealth />} />
          
          {/* Catch-all route - redirect to Page 1 */}
          <Route path="*" element={<Navigate to="/cameras" replace />} />
        </Routes>
      </Router>
    </GlobalStateProvider>
  );
}

export default App;
