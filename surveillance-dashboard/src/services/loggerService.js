// ============================================================================
// LOGGER SERVICE
// Handles CSV logging and download functionality
// ============================================================================

const loggerService = {
  /**
   * Create a log entry object
   * @param {string} eventType - Type of event (risk_change, alert_generated, etc.)
   * @param {string} entityId - ID of the entity (camera/zone/alert)
   * @param {string} entityType - Type of entity (camera/zone/alert/system)
   * @param {number|null} riskScore - Risk score value
   * @param {number|null} confidence - Confidence value
   * @param {string} status - Status (normal/suspicious/high_risk/active/resolved)
   * @param {string} description - Human-readable description
   * @returns {object} Log entry object
   */
  createLogEntry: (eventType, entityId, entityType, riskScore, confidence, status, description) => {
    return {
      timestamp: new Date().toISOString(),
      eventType,
      entityId,
      entityType,
      riskScore: riskScore !== null && riskScore !== undefined ? riskScore.toFixed(2) : 'N/A',
      confidence: confidence !== null && confidence !== undefined ? confidence.toFixed(2) : 'N/A',
      status,
      description
    };
  },

  /**
   * Generate CSV content from logs array
   * @param {Array} logs - Array of log entry objects
   * @returns {string} CSV formatted string
   */
  generateCSV: (logs) => {
    // CSV Headers
    const headers = [
      'timestamp',
      'event_type',
      'entity_id',
      'entity_type',
      'risk_score',
      'confidence',
      'status',
      'description'
    ];

    // Convert logs to CSV rows
    const rows = logs.map(log => [
      log.timestamp,
      log.eventType,
      log.entityId,
      log.entityType,
      log.riskScore,
      log.confidence,
      log.status,
      `"${log.description}"` // Wrap description in quotes to handle commas
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },

  /**
   * Download logs as CSV file
   * @param {Array} logs - Array of log entry objects
   * @param {string} filename - Optional custom filename
   */
  downloadCSV: (logs, filename) => {
    // Generate CSV content
    const csv = loggerService.generateCSV(logs);

    // Create blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const defaultFilename = `surveillance_logs_${date}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Export logs for external use (returns CSV string)
   * @param {Array} logs - Array of log entry objects
   * @returns {string} CSV formatted string
   */
  exportLogs: (logs) => {
    return loggerService.generateCSV(logs);
  },

  /**
   * Filter logs by event type
   * @param {Array} logs - Array of log entry objects
   * @param {string} eventType - Event type to filter by
   * @returns {Array} Filtered logs
   */
  filterByEventType: (logs, eventType) => {
    return logs.filter(log => log.eventType === eventType);
  },

  /**
   * Filter logs by entity
   * @param {Array} logs - Array of log entry objects
   * @param {string} entityId - Entity ID to filter by
   * @returns {Array} Filtered logs
   */
  filterByEntity: (logs, entityId) => {
    return logs.filter(log => log.entityId === entityId);
  },

  /**
   * Filter logs by time range
   * @param {Array} logs - Array of log entry objects
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   * @returns {Array} Filtered logs
   */
  filterByTimeRange: (logs, startTime, endTime) => {
    return logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  },

  /**
   * Get log statistics
   * @param {Array} logs - Array of log entry objects
   * @returns {object} Statistics object
   */
  getStatistics: (logs) => {
    const stats = {
      totalLogs: logs.length,
      eventTypes: {},
      entityTypes: {},
      statuses: {}
    };

    logs.forEach(log => {
      // Count event types
      stats.eventTypes[log.eventType] = (stats.eventTypes[log.eventType] || 0) + 1;

      // Count entity types
      stats.entityTypes[log.entityType] = (stats.entityTypes[log.entityType] || 0) + 1;

      // Count statuses
      stats.statuses[log.status] = (stats.statuses[log.status] || 0) + 1;
    });

    return stats;
  },

  /**
   * Get recent logs (last N entries)
   * @param {Array} logs - Array of log entry objects
   * @param {number} count - Number of recent logs to retrieve
   * @returns {Array} Recent logs (newest first)
   */
  getRecentLogs: (logs, count = 10) => {
    return logs.slice(-count).reverse();
  }
};

export default loggerService;