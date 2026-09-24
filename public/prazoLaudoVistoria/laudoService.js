const LaudoService = {
    
    /**
     * Converte uma string no formato DD/MM/AAAA para um objeto Date do JavaScript.
     * @param {string} dateString - A data digitada pelo usuário.
     * @returns {Date|null} - Retorna o objeto Date ou null se a data for inválida.
     */
    parseDate: function(dateString) {
        // Expressão regular para garantir que o formato seja exatamente DD/MM/AAAA
        const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regexData.test(dateString)) return null;

        const [dia, mes, ano] = dateString.split('/');
        // O JavaScript conta os meses de 0 a 11, por isso fazemos mes - 1
        const data = new Date(ano, mes - 1, dia);

        if (isNaN(data.getTime()) || data.getDate() != dia) return null;
        
        return data;
    },

    /**
     * Calcula se o laudo ainda está no prazo de validade de 45 dias.
     * @param {string} dataAprovacaoStr - Data de aprovação no formato DD/MM/AAAA.
     * @param {Date} dataAtual - Data do dia de hoje para comparação.
     * @returns {Object} - Objeto contendo o resultado da validação, cores e mensagens.
     */
    verificarValidade: function(dataAprovacaoStr, dataAtual) {
        const dataAprovacao = this.parseDate(dataAprovacaoStr);
        
        if (!dataAprovacao) {
            return { erro: 'Por favor, insira uma data de aprovação válida no formato DD/MM/AAAA.' };
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

        const dataValidade = new Date(dataAprovacao);
        dataValidade.setDate(dataAprovacao.getDate() + 45); 
        
        const dataValidadeFormatada = dataValidade.toLocaleDateString('pt-BR');

        // Zeramos as horas, minutos e segundos de ambas as datas 
        // para que a comparação foque puramente no calendário
        dataValidade.setHours(0, 0, 0, 0);
        dataAtual.setHours(0, 0, 0, 0);

        if (dataAtual <= dataValidade) {
            // Laudo Válido
            resultado.icone = '✅';
            resultado.titulo = 'Ainda dentro do prazo!';
            resultado.descricao = `Valido até o dia ${dataValidadeFormatada}`;
            resultado.corFundo = 'bg-green-100'; 
            resultado.corTexto = 'text-green-800'; 
            resultado.tocarSom = true; 
        } else {
            // Laudo Expirado
            
            // 1. Criamos a nossa lista de mensagens divertidas
            const mensagensDivertidas = [
                "Vish mano, deu ruim nessa bagaça!",
                "Eita pemba! Já era =/",
                "PutzQueparola!",
                "Lascou-se tudo, meu chapa!",
                "Ih, rapaz! Deu ruim para essa vistoria."
            ];

            const diaDoMes = dataAtual.getDate();
            
        
            const indiceEscolhido = diaDoMes % mensagensDivertidas.length;

            resultado.icone = '❌';
            resultado.titulo = mensagensDivertidas[indiceEscolhido];
            resultado.descricao = `O laudo expirou no dia ${dataValidadeFormatada}`;
            resultado.corFundo = 'bg-red-100'; 
            resultado.corTexto = 'text-red-800'; 
        }

        return resultado;
    }
};