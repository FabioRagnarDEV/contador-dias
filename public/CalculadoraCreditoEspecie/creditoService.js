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
            const diffMs        = dataFinal - dataAtual;
            const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (dataFinal <= dataAtual) {
                resultado.icone = '✅';
                resultado.titulo = 'SIM, está apto para receber.';
                resultado.descricao = `O prazo de 180 dias foi cumprido em ${dataFinalFormatada}.`;
                resultado.corFundo = 'bg-green-100';
                resultado.corTexto = 'text-green-800';
                resultado.tocarSom = true;
                resultado.diasRestantes = 0;
                resultado.dataFinalFormatada = dataFinalFormatada;
            } else {
                const mensagensEngracadas = [
                    "Calma, que ainda não chegou a hora!",
                    "Eita! O caixa ainda está de férias.",
                    "Rapaz... esse dinheiro ainda tá marinhando.",
                    "Paciência, meu consagrado! O prazo ainda não deu.",
                    "Ainda não, chefe. O relógio tá contando.",
                    "Ih, esse crédito tá segurando as pontas por enquanto!",
                    "Aguenta aí que o prazo ainda não bateu o ponto.",
                    "Ainda não rolou. O contador de dias não mente!",
                    "O crédito tá lá, mas ainda não tá liberado não.",
                    "Mais um pouco de paciência e o crédito vira espécie!",
                    "Ainda está no forno, esperando os 180 dias assarem.",
                    "Quase lá! Mas ainda falta um tiquinho.",
                    "O relógio tá correndo, mas ainda não chegou no fim.",
                    "Esse crédito tá em modo espera ainda.",
                    "Vish, ainda tem dias pela frente. Paciência é a chave!",
                    "Ainda tá no prazo de carência, meu chapa.",
                    "O dinheiro existe, mas ainda tá de quarentena.",
                    "Putz! Ainda não, o prazo disse que não.",
                    "Esse crédito ainda não terminou de contar os dias.",
                    "Eita! O prazo ainda tá de pé, firme e forte.",
                ];
                resultado.icone = '⏳';
                resultado.titulo = 'NÃO, ainda não cumpriu o prazo.';
                resultado.descricao = `Estará apto para receber a partir de ${dataFinalFormatada}.`;
                resultado.corFundo = 'bg-red-100';
                resultado.corTexto = 'text-red-800';
                resultado.diasRestantes = diasRestantes;
                resultado.dataFinalFormatada = dataFinalFormatada;
                resultado.listaMensagens = mensagensEngracadas;
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