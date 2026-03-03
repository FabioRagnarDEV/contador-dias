// leiArrependimentoService.js
const LeiArrependimentoService = {
    
    parseDate: function(dateString) {
        const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regexData.test(dateString)) return null;

        const [dia, mes, ano] = dateString.split('/');
        const data = new Date(ano, mes - 1, dia);

        if (isNaN(data.getTime()) || data.getDate() != dia) return null;
        return data;
    },

    /**
     * Calcula o prazo final de arrependimento (7 dias corridos).
     */
    calcularPrazo: function(dataPagamentoStr, dataAtual) {
        const dataPagamento = this.parseDate(dataPagamentoStr);
        if (!dataPagamento) {
            return { erro: 'Por favor, insira a data do pagamento no formato DD/MM/AAAA ou verifique se a data é válida.' };
        }

        const prazoFinal = new Date(dataPagamento);
        prazoFinal.setDate(dataPagamento.getDate() + 6); // Dia 1 (Hoje) + 6 dias = Dia 7

        const dataAtualCopia = new Date(dataAtual);
        dataAtualCopia.setHours(0, 0, 0, 0);
        prazoFinal.setHours(0, 0, 0, 0); // Garante comparação exata dos dias

        const prazoFinalFormatado = prazoFinal.toLocaleDateString('pt-BR');
        const prazoFinalCompleto = prazoFinalFormatado + ' às 23:59';
        
        // Verificação do Dia da Semana
        const diaDaSemana = prazoFinal.getDay(); // 0 = Domingo, 6 = Sábado
        const isFimDeSemana = (diaDaSemana === 0 || diaDaSemana === 6);
        const nomeDiaFimSemana = diaDaSemana === 0 ? "Domingo" : (diaDaSemana === 6 ? "Sábado" : "");

        const estaNoPrazo = dataAtualCopia <= prazoFinal;

        return {
            erro: null,
            estaNoPrazo: estaNoPrazo,
            icone: estaNoPrazo ? '✅' : '❌',
            titulo: estaNoPrazo ? 'SIM, está no prazo.' : 'NÃO, o prazo expirou.',
            descricao: estaNoPrazo ? `O direito de arrependimento expira em ${prazoFinalCompleto}.` : `O período de 7 dias terminou em ${prazoFinalCompleto}.`,
            corFundo: estaNoPrazo ? 'bg-green-100' : 'bg-red-100',
            corTexto: estaNoPrazo ? 'text-green-800' : 'text-red-800',
            isFimDeSemana: isFimDeSemana,
            nomeDiaFimSemana: nomeDiaFimSemana,
            prazoFinalFormatado: prazoFinalFormatado
        };
    },

    gerarContagemDias: function(dataPagamentoStr) {
        const dataPagamento = this.parseDate(dataPagamentoStr);
        if (!dataPagamento) return null;

        let diasContagem = [];
        
        for (let i = 0; i < 7; i++) {
            const dataDia = new Date(dataPagamento);
            dataDia.setDate(dataPagamento.getDate() + i);
            
            const diaFormatado = dataDia.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
            const diaDaSemana = dataDia.getDay();
            
            diasContagem.push({
                diaNumero: i + 1,
                dataTexto: diaFormatado,
                isUltimoDia: i === 6,
                isFimDeSemana: (diaDaSemana === 0 || diaDaSemana === 6),
                nomeDia: diaDaSemana === 0 ? "Domingo" : (diaDaSemana === 6 ? "Sábado" : "")
            });
        }
        
        return diasContagem;
    }
};