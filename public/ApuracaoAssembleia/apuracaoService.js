const ApuracaoService = {

    pad(num, size) {
        return String(num).padStart(size, '0');
    },

    digitosPremio(premio) {
        return this.pad(premio, 5).split('').map(Number);
    },

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
        const cotaDe   = c => (c === 0 ? 1000 : c);
        const formacoes = ['3°4°5°', '2°3°4°', '1°2°3°'];
        const premioNomes = ['1º', '2º', '3º', '4º', '5º'];

        const resultado = centenas.map((c, i) => {
            const cota    = cotaDe(c);
            const premio  = Math.floor(i / 3) + 1;
            return {
                ordem: i + 1,
                centena: this.pad(c, 3),
                cota,
                excluida: cota > maxParticipantes,
                isPrincipal: i === 0,
                formacao: formacoes[i % 3],
                nomePremio: premioNomes[premio - 1]
            };
        });

        const principal    = resultado[0];
        const desempateItem = resultado.find(item => !item.excluida) || resultado[0];
        const desempate    = {
            centena: desempateItem.centena,
            origemTexto: `${desempateItem.ordem}ª centena extraída do ${desempateItem.nomePremio} prêmio (formação ${desempateItem.formacao})`
        };

        return { resultado, principal, desempate, tipo: 'centenas', maxParticipantes };
    },

    gerarMilhares(premios) {
        const milhares = [];
        for (const premio of premios) {
            const d = this.digitosPremio(premio);
            milhares.push(Number(`${d[1]}${d[2]}${d[3]}${d[4]}`));
            milhares.push(Number(`${d[0]}${d[1]}${d[2]}${d[3]}`));
        }
        return milhares;
    },

    apurarMilhares(premios, maxParticipantes) {
        const milhares    = this.gerarMilhares(premios);
        const cotaDe      = m => (m === 0 ? 10000 : m);
        const temExclusao = maxParticipantes > 5000;
        const temAdicionais = maxParticipantes >= 1001 && maxParticipantes <= 5000;
        const vezes       = temAdicionais ? Math.floor(10000 / maxParticipantes) - 1 : 0;
        const formacoes   = ['2°3°4°5°', '1°2°3°4°'];
        const premioNomes = ['1º', '2º', '3º', '4º', '5º'];

        const resultado = milhares.map((m, i) => {
            const cotaBruta = cotaDe(m);
            let cota = cotaBruta;
            let reduzido = false;

            if (temAdicionais && cotaBruta > maxParticipantes) {
                cota = cotaBruta % maxParticipantes || maxParticipantes;
                reduzido = true;
            }

            const premio = Math.floor(i / 2) + 1;
            return {
                ordem: i + 1,
                milharOriginal: this.pad(m, 4),
                milhar: reduzido ? this.pad(cota, 4) : this.pad(m, 4),
                cota,
                cotaBruta,
                reduzido,
                excluida: temExclusao && cotaBruta > maxParticipantes,
                isPrincipal: i === 0,
                formacao: formacoes[i % 2],
                nomePremio: premioNomes[premio - 1]
            };
        });

        const principal = resultado[0];
        let desempate;

        if (maxParticipantes <= 5000) {
            const item = resultado[0];
            const passos = [];
            let v = cotaDe(milhares[0]);
            passos.push(this.pad(v, 4));
            while (v > maxParticipantes) {
                v -= maxParticipantes;
                passos.push(this.pad(v, 4));
            }
            desempate = {
                numero: this.pad(v, 4),
                passos,
                tipo: 'subtracao',
                origemTexto: `${item.ordem}º milhar extraído do ${item.nomePremio} prêmio (formação ${item.formacao})`
            };
        } else {
            const ultimo = resultado[resultado.length - 1];
            desempate = {
                numero: ultimo.milhar,
                passos: [ultimo.milhar],
                tipo: 'ultimo',
                origemTexto: `${ultimo.ordem}º milhar extraído do ${ultimo.nomePremio} prêmio (formação ${ultimo.formacao})`
            };
        }

        return { resultado, principal, desempate, tipo: 'milhares', maxParticipantes, temAdicionais, vezes, temExclusao };
    }
};
