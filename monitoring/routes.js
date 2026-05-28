const path = require('path');
const logger = require('./logger');
const trafficAnalyzer = require('./trafficAnalyzer');
const alertSystem = require('./alertSystem');

function registerMonitoringRoutes(app, apenasAdmin) {
    app.get('/monitoramento', apenasAdmin, (req, res) => {
        res.sendFile(path.join(__dirname, 'frontend', 'monitoramento.html'));
    });

    app.get('/api/monitoring/stats', apenasAdmin, async (req, res) => {
        try {
            const logStats = await logger.getStats();
            const trafficStats = trafficAnalyzer.getStats();
            const alertStats = alertSystem.getStats();

            res.json({
                logs: logStats,
                traffic: trafficStats,
                alerts: alertStats
            });
        } catch (err) {
            res.status(500).json({ error: 'Erro ao obter estatísticas.' });
        }
    });

    app.get('/api/monitoring/logs', apenasAdmin, async (req, res) => {
        try {
            const type = req.query.type || 'app';
            const lines = parseInt(req.query.lines) || 100;
            const logs = await logger.getRecentLogs(type, lines);
            res.json(logs);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao obter logs.' });
        }
    });

    app.get('/api/monitoring/alerts', apenasAdmin, (req, res) => {
        const options = {
            severity: req.query.severity,
            unacknowledgedOnly: req.query.unacknowledged === 'true',
            type: req.query.type,
            limit: parseInt(req.query.limit) || 50
        };
        res.json(alertSystem.getAlerts(options));
    });

    app.post('/api/monitoring/alerts/:id/acknowledge', apenasAdmin, (req, res) => {
        const success = alertSystem.acknowledge(req.params.id);
        res.json({ success });
    });

    app.post('/api/monitoring/alerts/acknowledge-all', apenasAdmin, (req, res) => {
        alertSystem.acknowledgeAll();
        res.json({ success: true });
    });

    app.get('/api/monitoring/ip/:ip', apenasAdmin, (req, res) => {
        const details = trafficAnalyzer.getIPDetails(req.params.ip);
        if (!details) return res.status(404).json({ error: 'IP não encontrado.' });
        res.json(details);
    });

    app.post('/api/monitoring/ip/:ip/unblock', apenasAdmin, (req, res) => {
        trafficAnalyzer.unblockIP(req.params.ip);
        res.json({ success: true });
    });

    app.get('/api/monitoring/alerts/stream', apenasAdmin, (req, res) => {
        alertSystem.addSSEClient(res);
    });
}

module.exports = registerMonitoringRoutes;
