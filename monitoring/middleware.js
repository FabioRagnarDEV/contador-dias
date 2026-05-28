const logger = require('./logger');
const trafficAnalyzer = require('./trafficAnalyzer');

function monitoringMiddleware(req, res, next) {
    logger.request(req);

    const result = trafficAnalyzer.analyze(req, res);

    if (result.blocked) {
        logger.security('Requisição bloqueada', {
            ip: req.ip,
            path: req.originalUrl,
            reason: result.reason
        });
        return res.status(403).json({ error: 'Acesso bloqueado temporariamente.' });
    }

    next();
}

module.exports = monitoringMiddleware;
