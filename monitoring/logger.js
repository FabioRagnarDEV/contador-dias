const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
const SENSITIVE_PATTERNS = /(password|senha|secret|token|key|apiKey|authorization|cookie|session)[=:\s"']+[^\s"',}]+/gi;

class SecurityLogger {
    constructor() {
        if (!fs.existsSync(LOGS_DIR)) {
            fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
        this.currentDate = this._getDateString();
        this.stream = this._createStream();

        setInterval(() => this._checkRotation(), 60000);
    }

    _getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    _getLogFilePath(date, type = 'app') {
        return path.join(LOGS_DIR, `${type}-${date}.log`);
    }

    _createStream() {
        const filePath = this._getLogFilePath(this.currentDate);
        return fs.createWriteStream(filePath, { flags: 'a' });
    }

    _checkRotation() {
        const today = this._getDateString();
        if (today !== this.currentDate) {
            this.stream.end();
            this.currentDate = today;
            this.stream = this._createStream();
        }
    }

    _sanitize(message) {
        if (typeof message === 'string') {
            return message.replace(SENSITIVE_PATTERNS, '$1=***CENSURADO***');
        }
        if (typeof message === 'object') {
            const sanitized = { ...message };
            const sensitiveKeys = ['password', 'senha', 'secret', 'token', 'key', 'apiKey', 'authorization', 'cookie', 'secret_2fa'];
            for (const key of Object.keys(sanitized)) {
                if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
                    sanitized[key] = '***CENSURADO***';
                } else if (typeof sanitized[key] === 'string') {
                    sanitized[key] = sanitized[key].replace(SENSITIVE_PATTERNS, '$1=***CENSURADO***');
                }
            }
            return sanitized;
        }
        return message;
    }

    _write(level, message, metadata = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message: this._sanitize(message),
            ...this._sanitize(metadata)
        };

        const line = JSON.stringify(entry) + '\n';
        this.stream.write(line);

        if (level === 'CRITICAL' || level === 'SECURITY') {
            const securityPath = this._getLogFilePath(this.currentDate, 'security');
            fs.appendFileSync(securityPath, line);
        }

        if (process.env.NODE_ENV !== 'production') {
            const color = {
                INFO: '\x1b[36m',
                WARN: '\x1b[33m',
                ERROR: '\x1b[31m',
                CRITICAL: '\x1b[35m',
                SECURITY: '\x1b[41m\x1b[37m'
            }[level] || '\x1b[0m';
            console.log(`${color}[${level}]\x1b[0m ${entry.timestamp} - ${typeof message === 'object' ? JSON.stringify(message) : message}`);
        }
    }

    info(message, metadata) { this._write('INFO', message, metadata); }
    warn(message, metadata) { this._write('WARN', message, metadata); }
    error(message, metadata) { this._write('ERROR', message, metadata); }
    critical(message, metadata) { this._write('CRITICAL', message, metadata); }
    security(message, metadata) { this._write('SECURITY', message, metadata); }

    request(req) {
        this._write('INFO', 'Request', {
            ip: req.ip,
            method: req.method,
            path: req.originalUrl,
            userAgent: req.headers['user-agent'],
            user: req.session?.usuarioNome || 'anônimo'
        });
    }

    auth(event, req, details = {}) {
        this._write('SECURITY', `Auth: ${event}`, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            user: details.usuario || req.body?.usuario || 'desconhecido',
            ...details
        });
    }

    async getRecentLogs(type = 'app', lines = 100) {
        const filePath = this._getLogFilePath(this.currentDate, type);
        if (!fs.existsSync(filePath)) return [];

        const content = fs.readFileSync(filePath, 'utf-8');
        const allLines = content.trim().split('\n').filter(Boolean);
        return allLines.slice(-lines).map(line => {
            try { return JSON.parse(line); } catch { return { raw: line }; }
        });
    }

    async getStats() {
        const logs = await this.getRecentLogs('app', 1000);
        const securityLogs = await this.getRecentLogs('security', 500);

        const stats = {
            total: logs.length,
            byLevel: { INFO: 0, WARN: 0, ERROR: 0, CRITICAL: 0, SECURITY: 0 },
            securityEvents: securityLogs.length,
            lastHour: 0,
            uniqueIPs: new Set()
        };

        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

        for (const log of logs) {
            if (log.level) stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            if (log.timestamp > oneHourAgo) stats.lastHour++;
            if (log.ip) stats.uniqueIPs.add(log.ip);
        }

        stats.uniqueIPs = stats.uniqueIPs.size;
        return stats;
    }
}

module.exports = new SecurityLogger();
