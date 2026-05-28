const logger = require('./logger');
const trafficAnalyzer = require('./trafficAnalyzer');
const alertSystem = require('./alertSystem');
const monitoringMiddleware = require('./middleware');
const registerMonitoringRoutes = require('./routes');

module.exports = {
    logger,
    trafficAnalyzer,
    alertSystem,
    monitoringMiddleware,
    registerMonitoringRoutes
};
