
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const ALERTS_DIR = path.join(__dirname, '..', 'logs');

const ALERT_DEFINITIONS = {
    BRUTE_FORCE: {
        severity: 'CRITICAL',
        title: 'Tentativa de Brute Force',
        description: 'Múltiplas tentativas de login falharam de um mesmo IP',
        cooldownMs: 300000
    },
    FLOOD: {
        severity: 'HIGH',
        title: 'Flood/DDoS Detectado',
        description: 'Taxa de requisições extremamente alta de um IP',
        cooldownMs: 60000
    },
    SCANNER: {
        severity: 'HIGH',
        title: 'Scanner Malicioso Detectado',
        description: 'Ferramenta de scanning/hacking identificada pelo User-Agent',
        cooldownMs: 300000
    },
    SCANNING: {
        severity: 'MEDIUM',
        title: 'Scanning de Rotas',
        description: 'IP acessando múltiplas rotas suspeitas/inexistentes',
        cooldownMs: 300000
    },
    SCANNING_404: {
        severity: 'MEDIUM',
        title: 'Excesso de 404',
        description: 'IP gerando muitos erros 404 - possível enumeração',
        cooldownMs: 120000
    },
    HIGH_THREAT_SCORE: {
        severity: 'CRITICAL',
        title: 'Score de Ameaça Elevado',
        description: 'IP atingiu score de ameaça crítico baseado em múltiplos indicadores',
        cooldownMs: 600000
    },
    RATE_LIMIT_EXCEEDED: {
        severity: 'LOW',
        title: 'Rate Limit Excedido',
        description: 'IP excedeu o limite de requisições da API',
        cooldownMs: 60000
    },
    SUSPICIOUS_LOGIN: {
        severity: 'MEDIUM',
        title: 'Login Suspeito',
        description: 'Login de localização ou horário incomum',
        cooldownMs: 0
    },
    SERVER_ERROR: {
        severity: 'HIGH',
        title: 'Erro Interno do Servidor',
        description: 'Erro 500 detectado no servidor',
        cooldownMs: 30000
    }
};

class AlertSystem {
    constructor() {
        this.alerts = [];
        this.cooldowns = new Map();
        this.sseClients = [];
        this.counters = {
            total: 0,
            bySeverity: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
            last24h: 0
        };

        setInterval(() => this._cleanupOldAlerts(), 3600000);
    }

    trigger(type, data = {}) {
        const definition = ALERT_DEFINITIONS[type];
        if (!definition) {
            logger.warn(`Tipo de alerta desconhecido: ${type}`);
            return;
        }

        const cooldownKey = `${type}:${data.ip || 'global'}`;
        if (this._isInCooldown(cooldownKey, definition.cooldownMs)) {
            return;
        }

        const alert = {
            id: this._generateId(),
            type,
            severity: definition.severity,
            title: definition.title,
            description: definition.description,
            data,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };

        this.alerts.push(alert);
        this.counters.total++;
        this.counters.bySeverity[definition.severity]++;
        this.counters.last24h++;

        this.cooldowns.set(cooldownKey, Date.now());

        this._persistAlert(alert);

        this._notifyClients(alert);

        logger.security(`ALERTA [${definition.severity}]: ${definition.title}`, {
            type,
            ip: data.ip,
            details: data
        });

        if (definition.severity === 'CRITICAL') {
            logger.critical(`⚠️ ALERTA CRÍTICO: ${definition.title}`, data);
        }

        return alert;
    }

    _isInCooldown(key, cooldownMs) {
        if (cooldownMs === 0) return false;
        const lastTriggered = this.cooldowns.get(key);
        if (!lastTriggered) return false;
        return (Date.now() - lastTriggered) < cooldownMs;
    }

    _generateId() {
        return `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }

    _persistAlert(alert) {
        const date = new Date().toISOString().split('T')[0];
        const filePath = path.join(ALERTS_DIR, `alerts-${date}.log`);
        const line = JSON.stringify(alert) + '\n';
        fs.appendFileSync(filePath, line);
    }

    _notifyClients(alert) {
        const message = `data: ${JSON.stringify(alert)}\n\n`;
        this.sseClients = this.sseClients.filter(client => {
            try {
                client.write(message);
                return true;
            } catch {
                return false; // Remover clientes desconectados
            }
        });
    }

    addSSEClient(res) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        });

        const unacknowledged = this.alerts.filter(a => !a.acknowledged).slice(-10);
        for (const alert of unacknowledged) {
            res.write(`data: ${JSON.stringify(alert)}\n\n`);
        }

        this.sseClients.push(res);

        res.on('close', () => {
            this.sseClients = this.sseClients.filter(c => c !== res);
        });
    }

    acknowledge(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledgedAt = new Date().toISOString();
            return true;
        }
        return false;
    }

    acknowledgeAll() {
        const now = new Date().toISOString();
        this.alerts.forEach(a => {
            if (!a.acknowledged) {
                a.acknowledged = true;
                a.acknowledgedAt = now;
            }
        });
    }

    getAlerts(options = {}) {
        let filtered = [...this.alerts];

        if (options.severity) {
            filtered = filtered.filter(a => a.severity === options.severity);
        }
        if (options.unacknowledgedOnly) {
            filtered = filtered.filter(a => !a.acknowledged);
        }
        if (options.type) {
            filtered = filtered.filter(a => a.type === options.type);
        }

        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const limit = options.limit || 50;
        return filtered.slice(0, limit);
    }

    getStats() {
        const now = Date.now();
        const last24h = this.alerts.filter(a => 
            new Date(a.timestamp).getTime() > now - 86400000
        );

        return {
            total: this.counters.total,
            bySeverity: { ...this.counters.bySeverity },
            last24h: last24h.length,
            unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
            byType: this._countByType(last24h),
            connectedClients: this.sseClients.length
        };
    }

    _countByType(alerts) {
        const counts = {};
        for (const alert of alerts) {
            counts[alert.type] = (counts[alert.type] || 0) + 1;
        }
        return counts;
    }

    _cleanupOldAlerts() {
        const cutoff = Date.now() - 86400000;
        this.alerts = this.alerts.filter(a => 
            new Date(a.timestamp).getTime() > cutoff
        );
    }
}

module.exports = new AlertSystem();
