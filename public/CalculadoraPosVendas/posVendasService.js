const PosVendasService = {

    feriadosPorAno: {},

    async carregarFeriados(ano) {
        if (this.feriadosPorAno[ano]) return;
        try {
            const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`);
            if (!response.ok) throw new Error('Falha na resposta da API');
            const data = await response.json();
            this.feriadosPorAno[ano] = data.map(f => f.date);
        } catch (error) {
            console.warn('Feriados indisponíveis para', ano, '— cálculo sem feriados nacionais.');
            this.feriadosPorAno[ano] = []; // continua sem feriados
        }
    },

    // Converte string "YYYY-MM-DD" para Date local sem deslocamento de fuso
    parseDateLocal(str) {
        const [ano, mes, dia] = str.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
    },

    isFeriado(date) {
        const ano = date.getFullYear();
        if (!this.feriadosPorAno[ano]) return false;
        const pad = n => String(n).padStart(2, '0');
        const dataFormatada = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        return this.feriadosPorAno[ano].includes(dataFormatada);
    },

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6;
    },

    addBusinessDays(startDate, days) {
        let currentDate = new Date(startDate);
        let addedDays = 0;
        while (addedDays < days) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (!this.isWeekend(currentDate) && !this.isFeriado(currentDate)) {
                addedDays++;
            }
        }
        return currentDate;
    },

    // Conta dias úteis ENTRE duas datas, sem contar o dia inicial
    countBusinessDays(startDate, endDate) {
        let count = 0;
        const current = new Date(startDate);
        current.setDate(current.getDate() + 1); // começa no dia seguinte ao de abertura
        while (current <= endDate) {
            if (!this.isWeekend(current) && !this.isFeriado(current)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }
        return count;
    },

    async calcularPVD(dataEfetivacaoStr, dataAtual) {
        if (!dataEfetivacaoStr) return { erro: 'Por favor, informe a data da efetivação.' };

        const dataEfetivacao = this.parseDateLocal(dataEfetivacaoStr);

        await this.carregarFeriados(dataEfetivacao.getFullYear());

        const prazoFinal = this.addBusinessDays(dataEfetivacao, 2);

        const dataAtualNorm = new Date(dataAtual);
        dataAtualNorm.setHours(0, 0, 0, 0);
        prazoFinal.setHours(0, 0, 0, 0);

        if (dataAtualNorm > prazoFinal) {
            return {
                sucesso: true,
                mensagem: 'Prazo de 48h úteis excedido. Abrir vermelha comercial para a ouvidoria.',
                corFundo: 'bg-red-100',
                corTexto: 'text-red-800'
            };
        } else {
            return {
                sucesso: true,
                mensagem: 'Dentro do prazo de 48h úteis. Direcione ou chame alguém do pós vendas imediatamente para fazer contato com o consorciado.',
                corFundo: 'bg-green-100',
                corTexto: 'text-green-800'
            };
        }
    },

    async calcularCPV(dataAberturaStr, numeroCaso, dataAtual) {
        if (!dataAberturaStr || !numeroCaso) return { erro: 'Por favor, preencha todos os campos.' };

        const dataAbertura = this.parseDateLocal(dataAberturaStr);
        const dataAtualNorm = new Date(dataAtual);
        dataAtualNorm.setHours(0, 0, 0, 0);

        await this.carregarFeriados(dataAbertura.getFullYear());
        if (dataAbertura.getFullYear() !== dataAtualNorm.getFullYear()) {
            await this.carregarFeriados(dataAtualNorm.getFullYear());
        }

        const diffBusinessDays = this.countBusinessDays(dataAbertura, dataAtualNorm);
        const prazoTotal = 50;

        if (diffBusinessDays > prazoTotal) {
            return {
                sucesso: true,
                mensagem: `${prazoTotal} dias úteis excedidos. Abrir um caso de vermelha comercial e anexar as evidências se já os tiver.`,
                corFundo: 'bg-red-100',
                corTexto: 'text-red-800'
            };
        } else {
            const diasRestantes = prazoTotal - diffBusinessDays;
            const verbo = diasRestantes === 1 ? 'resta' : 'restam';
            const plural = diasRestantes === 1 ? 'dia útil' : 'dias úteis';
            return {
                sucesso: true,
                mensagem: `Para o caso ${numeroCaso}, ${verbo} ${diasRestantes} ${plural} para tratativa. Abrir caso de dúvida para a fila do setor 'Pós-Vendas'.`,
                corFundo: 'bg-blue-50',
                corTexto: 'text-blue-800'
            };
        }
    },

    calcularDV(dataAberturaStr, numeroCaso, dataAtual) {
        if (!dataAberturaStr || !numeroCaso) return { erro: 'Por favor, preencha todos os campos.' };

        const dataAbertura = this.parseDateLocal(dataAberturaStr);
        const dataAtualNorm = new Date(dataAtual);
        dataAtualNorm.setHours(0, 0, 0, 0);
        dataAbertura.setHours(0, 0, 0, 0);

        if (dataAbertura > dataAtualNorm) {
            return { erro: 'A data de abertura não pode ser no futuro.' };
        }

        const dataLimite = new Date(dataAbertura);
        dataLimite.setDate(dataLimite.getDate() + 90);

        const diferencaTempo = dataLimite - dataAtualNorm;
        const diasRestantes = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diasRestantes >= 0) {
            return {
                sucesso: true,
                mensagem: `Para o caso ${numeroCaso} ainda restam ${diasRestantes} dias para tratativa.\n\nPor favor, acionar o pós vendas imediatamente para tratativa, pois está dentro do prazo de tratativa.`,
                corFundo: 'bg-green-100',
                corTexto: 'text-green-800'
            };
        } else {
            const diasExpirados = Math.abs(diasRestantes);
            return {
                sucesso: true,
                mensagem: `Para o caso ${numeroCaso}, o prazo de 90 dias corridos expirou há ${diasExpirados} dias.`,
                corFundo: 'bg-red-100',
                corTexto: 'text-red-800'
            };
        }
    }
};
