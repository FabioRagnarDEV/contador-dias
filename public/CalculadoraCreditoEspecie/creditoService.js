const CreditoService = {
    
    parseDate: function(dateString) {
        const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regexData.test(dateString)) return null;

        const [dia, mes, ano] = dateString.split('/');
        const data = new Date(ano, mes - 1, dia);

        if (isNaN(data.getTime()) || data.getDate() != dia) return null;
        return data;
    },

    calcularElegibilidade: function(dataContemplacaoStr, grupoEncerrado, dataEncerramentoStr, dataAtual) {
        const dataContemplacao = this.parseDate(dataContemplacaoStr);
        if (!dataContemplacao) {
            return { erro: 'Por favor, insira uma data de contemplação válida.' };
        }

        let resultado = {
            erro: null,
            icone: '',
            titulo: '',
            descricao: '',
            corFundo: '',
            corTexto: '',
            tocarSom: false
        };

        if (grupoEncerrado) {
            const dataEncerramento = this.parseDate(dataEncerramentoStr);
            if (!dataEncerramento) {
                return { erro: 'Por favor, insira uma data de encerramento de grupo válida.' };
            }

            if (dataAtual >= dataEncerramento) {
                resultado.icone = '✅';
                resultado.titulo = 'SIM, pode receber imediatamente.';
                resultado.descricao = 'O grupo já encerrou, dispensando o prazo de 180 dias.';
                resultado.corFundo = 'bg-green-100';
                resultado.corTexto = 'text-green-800';
                resultado.tocarSom = true;
            } else {
                resultado.icone = 'ℹ️';
                resultado.titulo = 'O grupo ainda não encerrou.';
                resultado.descricao = 'A data de encerramento é futura. A regra de 180 dias ainda se aplica.';
                resultado.corFundo = 'bg-yellow-100';
                resultado.corTexto = 'text-yellow-800';
            }
        } else {
            const dataFinal = new Date(dataContemplacao);
            dataFinal.setDate(dataContemplacao.getDate() + 180); 
            
            const dataFinalFormatada = dataFinal.toLocaleDateString('pt-BR');

            if (dataFinal <= dataAtual) {
                resultado.icone = '✅';
                resultado.titulo = 'SIM, está apto para receber.';
                resultado.descricao = `O prazo de 180 dias foi cumprido em ${dataFinalFormatada}.`;
                resultado.corFundo = 'bg-green-100';
                resultado.corTexto = 'text-green-800';
                resultado.tocarSom = true;
            } else {
                resultado.icone = '❌';
                resultado.titulo = 'NÃO, ainda não cumpriu o prazo.';
                resultado.descricao = `Estará apto para receber a partir de ${dataFinalFormatada}.`;
                resultado.corFundo = 'bg-red-100';
                resultado.corTexto = 'text-red-800';
            }
        }

        return resultado;
    },

    processarCalculoCreditoDebito: function(credito, debito, dataContemplacaoStr) {
        const liquido = credito - debito;

        if (liquido <= 0) {
            return { 
                sucesso: false, 
                mensagem: 'O saldo devedor é igual ou superior ao crédito disponível. Não haverá valor em espécie a receber.' 
            };
        }

        let dataContemplacao;
        
        if (dataContemplacaoStr.includes('/')) {
            dataContemplacao = this.parseDate(dataContemplacaoStr);
        } else {
            dataContemplacao = new Date(dataContemplacaoStr + 'T12:00:00');
        }

        if (!dataContemplacao || isNaN(dataContemplacao.getTime())) {
             return { 
                sucesso: false, 
                mensagem: 'Por favor, insira uma data de contemplação válida.' 
            };
        }

        const dataLiberacao = new Date(dataContemplacao.getTime() + (180 * 24 * 60 * 60 * 1000));

        return {
            sucesso: true,
            liquido: liquido,
            dataLiberacao: dataLiberacao
        };
    }
};