// ============================================================================
// COLOR CONSTANTS
// ============================================================================

export const COLORS = {
  // Background colors
  BG_DARKEST: '#0a0e1a',
  BG_DARK: '#151b2e',
  BG_PANEL: '#1a2332',
  BG_CARD: '#1e293b',
  
  // Text colors
  TEXT_PRIMARY: '#e2e8f0',
  TEXT_SECONDARY: '#94a3b8',
  TEXT_MUTED: '#64748b',
  
  // Border colors
  BORDER_DEFAULT: '#1e293b',
  BORDER_LIGHT: '#334155',
  
  // Status colors
  STATUS_NORMAL: '#10b981',
  STATUS_SUSPICIOUS: '#f59e0b',
  STATUS_CRITICAL: '#ef4444',
  
  // Map colors
  MAP_BASE: '#0a1929',
  MAP_STREET: '#1e3a52',
  MAP_BUILDING: '#162b3d',
  
  // Accent colors
  ACCENT_BLUE: '#3b82f6',
  ACCENT_BLUE_LIGHT: '#60a5fa',
};

// ============================================================================
// RISK THRESHOLDS
// ============================================================================

export const RISK_THRESHOLDS = {
  NORMAL: 0.40,        // Below 0.40 = normal
  SUSPICIOUS: 0.70,    // 0.40 - 0.69 = suspicious
  CRITICAL: 0.70,      // 0.70+ = critical/high_risk
};

// ============================================================================
// SYSTEM CONFIGURATION
// ============================================================================

export const SYSTEM_CONFIG = {
  SNAPSHOT_REFRESH_RATE: 5000,        // 5 seconds (in milliseconds)
  ALERT_CONFIRMATION_FRAMES: 3,       // 3 consecutive high-risk frames to confirm alert
  SIMULATION_DURATION: 60,            // 60 seconds total scenario
  SIMULATION_PAUSE_DURATION: 10000,   // 10 seconds pause before loop (in milliseconds)
  TOTAL_CAMERAS: 15,
  TOTAL_ZONES: 3,
};

// ============================================================================
// CAMERA INITIAL DATA - 15 CAMERAS
// ============================================================================

export const INITIAL_CAMERAS = [
  // ZONE A - North Sector (5 cameras)
  {
    id: 'CAM_01',
    name: 'Camera 01',
    zone: 'ZONE_A',
    riskScore: 0.15,
    confidence: 0.92,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_01',
    position: { x: 120, y: 60 }
  },
  {
    id: 'CAM_02',
    name: 'Camera 02',
    zone: 'ZONE_A',
    riskScore: 0.12,
    confidence: 0.91,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_02',
    position: { x: 180, y: 50 }
  },
  {
    id: 'CAM_03',
    name: 'Camera 03',
    zone: 'ZONE_A',
    riskScore: 0.18,
    confidence: 0.89,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_03',
    position: { x: 240, y: 70 }
  },
  {
    id: 'CAM_04',
    name: 'Camera 04',
    zone: 'ZONE_A',
    riskScore: 0.14,
    confidence: 0.90,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_04',
    position: { x: 150, y: 100 }
  },
  {
    id: 'CAM_05',
    name: 'Camera 05',
    zone: 'ZONE_A',
    riskScore: 0.16,
    confidence: 0.88,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_05',
    position: { x: 210, y: 90 }
  },

  // ZONE B - Central Sector (5 cameras)
  {
    id: 'CAM_06',
    name: 'Camera 06',
    zone: 'ZONE_B',
    riskScore: 0.15,
    confidence: 0.93,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_06',
    position: { x: 130, y: 180 }
  },
  {
    id: 'CAM_07',
    name: 'Camera 07',
    zone: 'ZONE_B',
    riskScore: 0.14,
    confidence: 0.90,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_07',
    position: { x: 180, y: 190 }
  },
  {
    id: 'CAM_08',
    name: 'Camera 08',
    zone: 'ZONE_B',
    riskScore: 0.16,
    confidence: 0.88,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_08',
    position: { x: 230, y: 200 }
  },
  {
    id: 'CAM_09',
    name: 'Camera 09',
    zone: 'ZONE_B',
    riskScore: 0.13,
    confidence: 0.92,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_09',
    position: { x: 160, y: 220 }
  },
  {
    id: 'CAM_10',
    name: 'Camera 10',
    zone: 'ZONE_B',
    riskScore: 0.17,
    confidence: 0.87,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_10',
    position: { x: 200, y: 210 }
  },

  // ZONE C - South Sector (5 cameras)
  {
    id: 'CAM_11',
    name: 'Camera 11',
    zone: 'ZONE_C',
    riskScore: 0.13,
    confidence: 0.94,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_11',
    position: { x: 140, y: 290 }
  },
  {
    id: 'CAM_12',
    name: 'Camera 12',
    zone: 'ZONE_C',
    riskScore: 0.17,
    confidence: 0.87,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_12',
    position: { x: 180, y: 300 }
  },
  {
    id: 'CAM_13',
    name: 'Camera 13',
    zone: 'ZONE_C',
    riskScore: 0.19,
    confidence: 0.86,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_13',
    position: { x: 220, y: 310 }
  },
  {
    id: 'CAM_14',
    name: 'Camera 14',
    zone: 'ZONE_C',
    riskScore: 0.15,
    confidence: 0.91,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_14',
    position: { x: 160, y: 330 }
  },
  {
    id: 'CAM_15',
    name: 'Camera 15',
    zone: 'ZONE_C',
    riskScore: 0.14,
    confidence: 0.89,
    status: 'normal',
    imagePlaceholder: 'https://via.placeholder.com/640x360/1a1a2e/ffffff?text=CAM_15',
    position: { x: 200, y: 320 }
  }
];

// ============================================================================
// ZONE INITIAL DATA - Updated for 15 cameras
// ============================================================================

export const INITIAL_ZONES = [
  {
    id: 'ZONE_A',
    name: 'North Sector',
    cameraIds: ['CAM_01', 'CAM_02', 'CAM_03', 'CAM_04', 'CAM_05'],
    aggregatedRisk: 0.15,
    status: 'normal'
  },
  {
    id: 'ZONE_B',
    name: 'Central Sector',
    cameraIds: ['CAM_06', 'CAM_07', 'CAM_08', 'CAM_09', 'CAM_10'],
    aggregatedRisk: 0.15,
    status: 'normal'
  },
  {
    id: 'ZONE_C',
    name: 'South Sector',
    cameraIds: ['CAM_11', 'CAM_12', 'CAM_13', 'CAM_14', 'CAM_15'],
    aggregatedRisk: 0.16,
    status: 'normal'
  }
];

// ============================================================================
// SIMULATION SCENARIO TIMELINE - Updated for new cameras
// ============================================================================

export const SCENARIO_TIMELINE = {
  // CAM_06 escalation (was CAM_04)
  CAM_06: {
    START_TIME: 10,
    PEAK_TIME: 25,
    START_RISK: 0.15,
    PEAK_RISK: 0.85,
    NORMALIZE_TIME: 45,
  },
  
  // CAM_07 escalation (was CAM_05)
  CAM_07: {
    START_TIME: 12,
    PEAK_TIME: 27,
    START_RISK: 0.14,
    PEAK_RISK: 0.80,
    NORMALIZE_TIME: 45,
  },
  
  // CAM_08 mild escalation (was CAM_06)
  CAM_08: {
    START_TIME: 15,
    PEAK_TIME: 22,
    START_RISK: 0.16,
    PEAK_RISK: 0.45,
    NORMALIZE_TIME: 30,
  }
};

// ============================================================================
// STATUS MAPPING
// ============================================================================

export const getStatusFromRisk = (riskScore) => {
  if (riskScore >= RISK_THRESHOLDS.CRITICAL) return 'high_risk';
  if (riskScore >= RISK_THRESHOLDS.NORMAL) return 'suspicious';
  return 'normal';
};

export const getColorFromStatus = (status) => {
  switch (status) {
    case 'high_risk':
      return COLORS.STATUS_CRITICAL;
    case 'suspicious':
      return COLORS.STATUS_SUSPICIOUS;
    case 'normal':
    default:
      return COLORS.STATUS_NORMAL;
  }
};

export const getColorFromRisk = (riskScore) => {
  const status = getStatusFromRisk(riskScore);
  return getColorFromStatus(status);
};

// ============================================================================
// FORMATTER UTILITIES
// ============================================================================

export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatRiskScore = (score) => {
  return score.toFixed(2);
};

export const formatConfidence = (confidence) => {
  return `${(confidence * 100).toFixed(0)}%`;
};

export const getTimeSince = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};