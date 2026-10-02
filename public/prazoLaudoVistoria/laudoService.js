const LaudoService = {

    parseDate: function(dateString) {
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return null;
        const [dia, mes, ano] = dateString.split('/');
        const data = new Date(ano, mes - 1, dia);
        if (isNaN(data.getTime()) || data.getDate() != dia) return null;
        return data;
    },

    verificarValidade: function(dataAprovacaoStr, dataAtual) {
        const dataAprovacao = this.parseDate(dataAprovacaoStr);

        if (!dataAprovacao) {
            return { erro: 'Por favor, insira uma data de aprovação válida no formato DD/MM/AAAA.' };
        }

        const dataValidade = new Date(dataAprovacao);
        dataValidade.setDate(dataAprovacao.getDate() + 45);
        dataValidade.setHours(0, 0, 0, 0);
        dataAtual.setHours(0, 0, 0, 0);

        const dataValidadeFormatada = dataValidade.toLocaleDateString('pt-BR');
        const diffMs = dataAtual - dataAprovacao;
        const diasPassados = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffVencidoMs = dataAtual - dataValidade;
        const diasVencidos = Math.max(0, Math.floor(diffVencidoMs / (1000 * 60 * 60 * 24)));

        if (dataAtual <= dataValidade) {
            return {
                erro: null,
                valido: true,
                dataValidadeFormatada,
                diasPassados: Math.max(0, diasPassados)
            };
        }

        const mensagensDivertidas = [
            "Vish mano, deu ruim nessa bagaça!",
            "Eita pemba! Já era =/",
            "PutzQueparola!",
            "Lascou-se tudo, meu chapa!",
            "Ih, rapaz! Deu ruim para essa vistoria.",
            "Ô meu patrão... essa vistoria veio com emoção!",
            "Ave Maria, que vistoria foi essa, criatura?",
            "Rapaz... até a vistoria arregalou o olho!",
            "Meu consagrado, o negócio azedou bonito!",
            "Ih, rapaz... essa aí não passou nem no cafezinho.",
            "Peraí que o trem descarrilhou!",
            "Eita! Essa vistoria veio sem dó nem piedade.",
            "Misericórdia, alguém desliga e liga de novo!",
            "Meu amigo... aí você forçou a amizade!",
            "Olha... não queria ser o portador dessa notícia não.",
            "Rapaz, essa vistoria resolveu trabalhar contra nós!",
            "Vixe Maria, o negócio ficou mais torto que parafuso espanado!",
            "Eita lasqueira! Essa não estava no roteiro.",
            "Ih... o negócio aqui saiu mais do eixo que roda de carrinho.",
            "Calma, patrão! Respira... porque a coisa complicou.",
            "Rapaz, essa vistoria foi buscar problema até onde não tinha!",
            "Meu chapa, hoje a vistoria acordou virada no Jiraya.",
            "Eita! O negócio desandou mais rápido que caldo de cana.",
            "Ih, rapaz... essa aí vai precisar de reza braba!",
            "Putz! Até o sistema ficou sem argumento agora.",
            "Vish... essa vistoria não quis colaborar com o cidadão.",
            "Eita, meu rei! O trem ficou mais feio que segunda-feira de manhã.",
            "Rapaz... essa aí foi de fazer o sistema pedir arrego!",
            "Ô desgrama! A vistoria resolveu testar nossa paciência.",
            "Ih, meu amigo... melhor nem perguntar como chegamos aqui.",
            "Eita! Essa vistoria deu aquela famosa complicada básica™.",
            "Vish, patrão... o negócio foi de 0 a lascou em dois segundos!",
            "Rapaz, deu ruim num nível que nem o Ctrl+Z resolve!",
            "Ave! Essa vistoria veio carregada de plot twist.",
            "Meu chapa... essa foi direto para a pasta 'deu ruim'.",
            "Ih! O sistema olhou para essa vistoria e falou: 'não vou nem comentar'.",
            "Eita! Essa aí fez até o cafezinho esfriar.",
            "Vish... essa vistoria está pedindo uma intervenção divina.",
            "Rapaz, se melhorar, piora!",
            "Putz! Essa vistoria conseguiu complicar o que já era complicado.",
            "Ih, rapaz... temos aqui um legítimo 'não era bem isso'.",
            "Eita lasqueira! Hoje a vistoria veio no modo hard.",
            "Vish mano... essa aí foi buscar problema no endereço errado!",
            "Meu consagrado, essa vistoria entrou oficialmente em território perigoso."
        ];

        return {
            erro: null,
            valido: false,
            dataValidadeFormatada,
            diasVencidos,
            listaMensagens: mensagensDivertidas
        };
    }
};
