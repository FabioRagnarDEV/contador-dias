const ApuracaoService = {

    pad(num, size) {
        return String(num).padStart(size, '0');
    },

    digitosPremio(premio) {
        const s = this.pad(premio, 5);
        return s.split('').map(Number);
    },

    // ─── GRUPOS ATÉ 1.000 — Centenas ────────────────────────
    // 3 centenas por prêmio × 5 prêmios = 15 centenas
    // Por prêmio: 3°4°5° / 2°3°4° / 1°2°3°
    gerarCentenas(premios) {
        const centenas = [];
        for (const premio of premios) {
            const d = this.digitosPremio(premio);
            centenas.push(Number(`${d[2]}${d[3]}${d[4]}`));
            centenas.push(Number(`${d[1]}${d[2]}${d[3]}`));
            centenas.push(Number(`${d[0]}${d[1]}${d[2]}`));
        }
        return centenas;
    },

    apurarCentenas(premios, maxParticipantes) {
        const centenas = this.gerarCentenas(premios);
        const cotaDeCentena = c => (c === 0 ? 1000 : c);

        const resultado = centenas.map((c, i) => {
            const cota = cotaDeCentena(c);
            const excluida = cota > maxParticipantes;
            return {
                ordem: i + 1,
                centena: this.pad(c, 3),
                cota,
                excluida,
                isPrincipal: i === 0
            };
        });

        const principal = resultado[0];

        // Desempate: última centena apurada (15ª = 1°2°3° do 5º prêmio)
        const desempate = resultado.find(item => item.excluida === false) || null;

        return { resultado, principal, desempate, tipo: 'centenas', maxParticipantes };
    },

    // ─── GRUPOS ACIMA DE 1.000 — Milhares ───────────────────
    // 2 milhares por prêmio × 5 prêmios = 10 milhares
    // Por prêmio: 2°3°4°5° / 1°2°3°4°
    gerarMilhares(premios) {
        const milhares = [];
        for (const premio of premios) {
            const d = this.digitosPremio(premio);
            milhares.push(Number(`${d[1]}${d[2]}${d[3]}${d[4]}`));
            milhares.push(Number(`${d[0]}${d[1]}${d[2]}${d[3]}`));
        }
        return milhares;
    },

    numerosAdicionais(cota, maxParticipantes) {
        const adicionais = [];
        const vezes = Math.floor(10000 / maxParticipantes) - 1;
        for (let i = 1; i <= vezes; i++) {
            let adicional = (cota + maxParticipantes * i) % 10000;
            adicionais.push(adicional === 0 ? 10000 : adicional);
        }
        return adicionais;
    },

    // Desempate de lance para grupos até 5.000 participantes:
    // Pega o 1º milhar (2°3°4°5° do 1º prêmio) e subtrai maxParticipantes
    // sucessivamente até que o resultado seja <= maxParticipantes.
    // Equivalente a: milhar % maxParticipantes, onde 0 representa maxParticipantes.
    calcularDesempateMilhar(milharBruto, maxParticipantes) {
        let valor = milharBruto === 0 ? 10000 : milharBruto;
        const passos = [];
        passos.push(valor);
        while (valor > maxParticipantes) {
            valor = valor - maxParticipantes;
            passos.push(valor);
        }
        return { valor, passos };
    },

    apurarMilhares(premios, maxParticipantes) {
        const milhares = this.gerarMilhares(premios);
        const cotaDeMilhar = m => (m === 0 ? 10000 : m);

        const temExclusao = maxParticipantes > 5000;
        const temAdicionais = maxParticipantes >= 1001 && maxParticipantes <= 5000;
        const vezes = temAdicionais ? Math.floor(10000 / maxParticipantes) - 1 : 0;

        const resultado = milhares.map((m, i) => {
            const cotaBruta = cotaDeMilhar(m);
            let cota = cotaBruta;
            let reduzido = false;

            // Grupos até 5.000: subtrai maxParticipantes até ficar dentro do limite
            if (temAdicionais && cotaBruta > maxParticipantes) {
                cota = cotaBruta % maxParticipantes;
                if (cota === 0) cota = maxParticipantes;
                reduzido = true;
            }

            const excluida = temExclusao && cotaBruta > maxParticipantes;

            return {
                ordem: i + 1,
                milharOriginal: this.pad(m, 4),
                milhar: reduzido ? this.pad(cota, 4) : this.pad(m, 4),
                cota,
                cotaBruta,
                reduzido,
                excluida,
                isPrincipal: i === 0
            };
        });

        const principal = resultado[0];

        // Desempate: 1º milhar já corrigido (regra subtração para <= 5000)
        // Grupos > 5000: último milhar apurado
        let desempate;
        if (maxParticipantes <= 5000) {
            const item = resultado[0];
            const passos = [];
            let v = cotaDeMilhar(milhares[0]);
            passos.push(this.pad(v, 4));
            while (v > maxParticipantes) {
                v = v - maxParticipantes;
                passos.push(this.pad(v, 4));
            }
            desempate = { numero: this.pad(v, 4), passos, tipo: 'subtracao' };
        } else {
            const ultimo = resultado[resultado.length - 1];
            desempate = { numero: ultimo.milhar, passos: [ultimo.milhar], tipo: 'ultimo' };
        }

        return {
            resultado,
            principal,
            desempate,
            tipo: 'milhares',
            maxParticipantes,
            temAdicionais,
            vezes,
            temExclusao
        };
    }
};
