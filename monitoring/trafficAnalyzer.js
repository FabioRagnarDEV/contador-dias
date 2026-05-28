const logger = require('./logger');
const alertSystem = require('./alertSystem');

const MALICIOUS_UA_PATTERNS = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /dirbuster/i,
    /gobuster/i, /wfuzz/i, /hydra/i, /burpsuite/i, /zap/i,
    /nuclei/i, /ffuf/i, /feroxbuster/i, /whatweb/i
];

const SUSPICIOUS_PATHS = [
    '/wp-admin', '/wp-login', '/.env', '/phpmyadmin', '/admin',
    '/.git', '/config', '/backup', '/shell', '/cmd',
    '/actuator', '/.well-known', '/xmlrpc.php', '/wp-content',
    '/api/v1', '/graphql', '/swagger', '/debug', '/trace'
];

class TrafficAnalyzer {
    constructor() {
        this.ipData = new Map();
        this.blockedIPs = new Map();
        this.config = {
            maxRequestsPerMinute: 60,
            maxFailedLoginsPerHour: 10,
            max404PerMinute: 20,
            scanDetectionThreshold: 5,
            blockDurationMs: 30 * 60 * 1000,
            cleanupIntervalMs: 5 * 60 * 1000
        };

        this.stats = {
            totalRequests: 0,
            blockedRequests: 0,
            anomaliesDetected: 0,
            bruteForceAttempts: 0,
            scanningAttempts: 0,
            suspiciousUAs: 0
        };

        setInterval(() => this._cleanup(), this.config.cleanupIntervalMs);
    }

    analyze(req, res) {
        const ip = req.ip;
        const now = Date.now();
        this.stats.totalRequests++;

        if (this._isBlocked(ip)) {
            this.stats.blockedRequests++;
            return { blocked: true, reason: 'IP temporariamente bloqueado' };
        }

        if (!this.ipData.has(ip)) {
            this.ipData.set(ip, {
                requests: [],
                failedLogins: [],
                notFoundRequests: [],
                suspiciousPaths: [],
                firstSeen: now,
                lastSeen: now,
                score: 0
            });
        }

        const data = this.ipData.get(ip);
        data.lastSeen = now;
        data.requests.push({ time: now, path: req.originalUrl, method: req.method });

        const results = [];
        results.push(this._checkRequestRate(ip, data, now));
        results.push(this._checkUserAgent(req, ip, data));
        results.push(this._checkSuspiciousPath(req, ip, data));

        const originalEnd = res.end;
        res.end = (...args) => {
            if (res.statusCode === 404) {
                this._record404(ip, data, req.originalUrl, now);
            }
            if (res.statusCode === 401 || res.statusCode === 403) {
                this._recordFailedAuth(ip, data, req.originalUrl, now);
            }
            originalEnd.apply(res, args);
        };

        this._updateThreatScore(ip, data);

        const anomalies = results.filter(r => r !== null);
        if (anomalies.length > 0) {
            this.stats.anomaliesDetected += anomalies.length;
        }

        return { blocked: false, anomalies };
    }

    recordFailedLogin(ip, usuario) {
        const now = Date.now();
        if (!this.ipData.has(ip)) {
            this.ipData.set(ip, {
                requests: [], failedLogins: [], notFoundRequests: [],
                suspiciousPaths: [], firstSeen: now, lastSeen: now, score: 0
            });
        }

        const data = this.ipData.get(ip);
        data.failedLogins.push({ time: now, usuario });

        const oneHourAgo = now - 3600000;
        const recentFails = data.failedLogins.filter(f => f.time > oneHourAgo);

        if (recentFails.length >= this.config.maxFailedLoginsPerHour) {
            this.stats.bruteForceAttempts++;
            this._blockIP(ip, 'Brute force detectado');

            logger.security('Brute force detectado - IP bloqueado', {
                ip,
                tentativas: recentFails.length,
                usuarios: [...new Set(recentFails.map(f => f.usuario))],
                duracao: '30 minutos'
            });

            alertSystem.trigger('BRUTE_FORCE', {
                ip,
                tentativas: recentFails.length,
                usuarios: [...new Set(recentFails.map(f => f.usuario))]
            });
        }
    }

    _checkRequestRate(ip, data, now) {
        const oneMinuteAgo = now - 60000;
        const recentRequests = data.requests.filter(r => r.time > oneMinuteAgo);

        if (recentRequests.length > this.config.maxRequestsPerMinute) {
            data.score += 15;
            logger.warn('Taxa de requisições elevada', {
                ip,
                requestsPerMinute: recentRequests.length,
                limite: this.config.maxRequestsPerMinute
            });

            if (recentRequests.length > this.config.maxRequestsPerMinute * 3) {
                this._blockIP(ip, 'DDoS/Flood detectado');
                alertSystem.trigger('FLOOD', { ip, requestsPerMinute: recentRequests.length });
            }

            return { type: 'HIGH_RATE', requestsPerMinute: recentRequests.length };
        }
        return null;
    }

    _checkUserAgent(req, ip, data) {
        const ua = req.headers['user-agent'] || '';

        if (!ua) {
            data.score += 10;
            logger.warn('Requisição sem User-Agent', { ip, path: req.originalUrl });
            return { type: 'NO_USER_AGENT' };
        }

        for (const pattern of MALICIOUS_UA_PATTERNS) {
            if (pattern.test(ua)) {
                data.score += 40;
                this.stats.suspiciousUAs++;
                this._blockIP(ip, `Scanner detectado: ${ua}`);

                logger.security('Scanner/ferramenta maliciosa detectada', {
                    ip, userAgent: ua, path: req.originalUrl
                });

                alertSystem.trigger('SCANNER', { ip, userAgent: ua });
                return { type: 'MALICIOUS_UA', userAgent: ua };
            }
        }

        return null;
    }

    _checkSuspiciousPath(req, ip, data) {
        const path = req.originalUrl.toLowerCase();

        for (const suspicious of SUSPICIOUS_PATHS) {
            if (path.includes(suspicious)) {
                data.suspiciousPaths.push({ time: Date.now(), path: req.originalUrl });
                data.score += 20;
                this.stats.scanningAttempts++;

                logger.security('Acesso a rota suspeita', {
                    ip, path: req.originalUrl, pattern: suspicious
                });

                if (data.suspiciousPaths.length >= this.config.scanDetectionThreshold) {
                    this._blockIP(ip, 'Scanning de rotas detectado');
                    alertSystem.trigger('SCANNING', {
                        ip,
                        paths: data.suspiciousPaths.map(p => p.path)
                    });
                }

                return { type: 'SUSPICIOUS_PATH', path: req.originalUrl };
            }
        }
        return null;
    }

    _record404(ip, data, path, now) {
        data.notFoundRequests.push({ time: now, path });

        const oneMinuteAgo = now - 60000;
        const recent404s = data.notFoundRequests.filter(r => r.time > oneMinuteAgo);

        if (recent404s.length >= this.config.max404PerMinute) {
            data.score += 25;
            this._blockIP(ip, 'Excesso de 404 - possível scanning');

            logger.security('Excesso de 404 detectado', {
                ip, count: recent404s.length, paths: recent404s.slice(-5).map(r => r.path)
            });

            alertSystem.trigger('SCANNING_404', { ip, count: recent404s.length });
        }
    }

    _recordFailedAuth(ip, data, path, now) {
        data.failedLogins.push({ time: now, path });
    }

    _updateThreatScore(ip, data) {
        const minutesSinceFirst = (Date.now() - data.firstSeen) / 60000;
        data.score = Math.max(0, data.score - Math.floor(minutesSinceFirst * 0.1));

        if (data.score >= 80) {
            this._blockIP(ip, `Score de ameaça elevado: ${data.score}`);
            alertSystem.trigger('HIGH_THREAT_SCORE', { ip, score: data.score });
        }
    }

    _blockIP(ip, reason) {
        this.blockedIPs.set(ip, {
            blockedAt: Date.now(),
            reason,
            expiresAt: Date.now() + this.config.blockDurationMs
        });

        logger.security(`IP bloqueado: ${reason}`, { ip, duracao: '30min' });
    }

    _isBlocked(ip) {
        const block = this.blockedIPs.get(ip);
        if (!block) return false;

        if (Date.now() > block.expiresAt) {
            this.blockedIPs.delete(ip);
            return false;
        }
        return true;
    }

    _cleanup() {
        const now = Date.now();
        const maxAge = 3600000;

        for (const [ip, data] of this.ipData.entries()) {
            data.requests = data.requests.filter(r => r.time > now - maxAge);
            data.failedLogins = data.failedLogins.filter(f => f.time > now - maxAge);
            data.notFoundRequests = data.notFoundRequests.filter(r => r.time > now - maxAge);

            if (data.requests.length === 0 && data.lastSeen < now - maxAge) {
                this.ipData.delete(ip);
            }
        }

        for (const [ip, block] of this.blockedIPs.entries()) {
            if (now > block.expiresAt) {
                this.blockedIPs.delete(ip);
            }
        }
    }

    getStats() {
        return {
            ...this.stats,
            activeIPs: this.ipData.size,
            blockedIPs: this.blockedIPs.size,
            blockedIPsList: Array.from(this.blockedIPs.entries()).map(([ip, info]) => ({
                ip,
                reason: info.reason,
                blockedAt: new Date(info.blockedAt).toISOString(),
                expiresAt: new Date(info.expiresAt).toISOString()
            }))
        };
    }

    getIPDetails(ip) {
        const data = this.ipData.get(ip);
        if (!data) return null;

        return {
            ip,
            firstSeen: new Date(data.firstSeen).toISOString(),
            lastSeen: new Date(data.lastSeen).toISOString(),
            score: data.score,
            totalRequests: data.requests.length,
            failedLogins: data.failedLogins.length,
            notFoundRequests: data.notFoundRequests.length,
            suspiciousPaths: data.suspiciousPaths.length,
            isBlocked: this._isBlocked(ip),
            recentPaths: data.requests.slice(-20).map(r => ({
                time: new Date(r.time).toISOString(),
                method: r.method,
                path: r.path
            }))
        };
    }

    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        logger.info(`IP desbloqueado manualmente: ${ip}`);
    }
}

module.exports = new TrafficAnalyzer();
