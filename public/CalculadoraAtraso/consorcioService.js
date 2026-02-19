const ConsorcioService = {
    
    /**
     * Calcula o status de atraso e se a cota deve ser cancelada.
     */
    analisarAtraso: function(dataVencimento, dataHoje, numeroParcelas, statusConsorciado, ehInauguracaoAntiga) {
        const diferencaTempo = dataHoje - dataVencimento;
        const diasAtraso = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diasAtraso < 1) {
            return { erro: 'A data de vencimento não indica atraso.' };
        }

        const limiteCancelamento = ehInauguracaoAntiga ? 2 : 3;
        
        let resultado = { diasAtraso, isCancelado: false, icone: '', titulo: '', descricao: '', acao: '', cor: '', corFundo: '' };

        if (statusConsorciado === 'contemplado') {
            if (diasAtraso > 15 || numeroParcelas >= 2) {
                resultado.icone = '🚨';
                resultado.titulo = 'RISCO JURÍDICO IMEDIATO!';
                resultado.descricao = `Cliente contemplado com ${diasAtraso} dias de atraso.`;
                resultado.acao = "Encaminhar para Jurídico/Cobrança urgente. Risco de Busca e Apreensão.";
                resultado.cor = 'text-red-700';
                resultado.corFundo = 'bg-red-50 border border-red-200';
            } else {
                resultado.icone = '⚠️';
                resultado.titulo = 'Atenção:';
                resultado.descricao = `Contemplado em atraso (${diasAtraso} dias).`;
                resultado.acao = "Realizar cobrança preventiva.";
                resultado.cor = 'text-orange-600';
                resultado.corFundo = 'bg-orange-50 border border-orange-200';
            }
        } else {
            if (numeroParcelas >= limiteCancelamento) {
                const textoRegra = ehInauguracaoAntiga ? "2 parcelas (Grupos até 06/24)" : "3 parcelas (Grupos pós 07/24)";
                resultado.icone = '🚫';
                resultado.titulo = 'COTA EM PROCESSO DE CANCELAMENTO';
                resultado.descricao = `Atingiu o limite de ${textoRegra}.`;
                resultado.acao = "A cota será excluída por inadimplência (Cláusula 39). Verifique o cálculo de devolução.";
                resultado.cor = 'text-red-700';
                resultado.corFundo = 'bg-red-50 border border-red-200';
                resultado.isCancelado = true;
            } else {
                resultado.icone = 'ℹ️';
                resultado.titulo = 'Cobrança Administrativa';
                resultado.descricao = `${diasAtraso} dias de atraso.`;
                resultado.acao = `Emitir boleto. O cancelamento ocorre com ${limiteCancelamento} parcelas vencidas.`;
                resultado.cor = 'text-blue-700';
                resultado.corFundo = 'bg-blue-50 border border-blue-200';
            }
        }

        return resultado;
    },

    /**
     * Calcula as multas e o valor de devolução (Cláusulas 41.1 e 42).
     */
    calcularDevolucao: function(valorCredito, valorPercentual, valorTotalPago) {
        const valorFundoComum = valorCredito * (valorPercentual / 100);
        
        let valorTaxasRetidas = valorTotalPago - valorFundoComum;
        if (valorTaxasRetidas < 0) valorTaxasRetidas = 0;

        const multaPrejuizoGrupo = valorFundoComum * 0.10; // 10% fixo (Cláusula 41.1)

        let taxaPenal = 0;
        if (valorPercentual <= 20) taxaPenal = 0.20;
        else if (valorPercentual <= 40) taxaPenal = 0.15;
        else if (valorPercentual <= 50) taxaPenal = 0.10;
        else taxaPenal = 0.00; // Acima de 50% é isento (Cláusula 42)
        
        const multaPenal = valorFundoComum * taxaPenal;
        const valorDevolucao = valorFundoComum - multaPrejuizoGrupo - multaPenal;

        return {
            valorFundoComum,
            valorTaxasRetidas,
            multaPrejuizoGrupo,
            taxaPenal,
            multaPenal,
            valorDevolucao
        };
    },

    /**
     * Calcula a diferença a pagar em caso de cota descontemplada.
     */
    calcularDescontemplacao: function(creditoGrupo, creditoCliente) {
        if (creditoGrupo <= 0 || creditoCliente <= 0) return 0;
        const diferenca = creditoGrupo - creditoCliente;
        return diferenca > 0 ? diferenca : 0;
    }
};