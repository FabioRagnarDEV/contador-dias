// Executado após o DOM e posVendasService.js já estarem carregados

(function () {

    // Controle de abas
    const tabs   = { pvd: 'pvd', cpv: 'cpv', dv: 'dv' };
    const btnMap = { pvd: 'btn-show-pvd', cpv: 'btn-show-cpv', dv: 'btn-show-dv' };

    function mostrarTab(id) {
        Object.keys(tabs).forEach(k => {
            document.getElementById(k).classList.add('hidden');
            document.getElementById(btnMap[k]).classList.remove('active');
        });
        document.getElementById(id).classList.remove('hidden');
        document.getElementById(btnMap[id]).classList.add('active');
    }

    document.getElementById('btn-show-pvd').addEventListener('click', () => mostrarTab('pvd'));
    document.getElementById('btn-show-cpv').addEventListener('click', () => mostrarTab('cpv'));
    document.getElementById('btn-show-dv').addEventListener('click',  () => mostrarTab('dv'));

    // Exibição de resultado
    function mostrarResultado(elId, erroId, resultado) {
        const el   = document.getElementById(elId);
        const erro = document.getElementById(erroId);
        erro.textContent = '';

        if (resultado.erro) {
            erro.textContent = resultado.erro;
            el.classList.add('hidden');
            return;
        }

        el.className = 'text-center mt-2 text-base font-semibold p-4 rounded-lg whitespace-pre-line resultado-box transition-all ' + resultado.corFundo + ' ' + resultado.corTexto;
        el.textContent = resultado.mensagem;
        el.classList.remove('hidden');
    }

    function limpar(inputIds, erroId, resultadoId) {
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        document.getElementById(erroId).textContent = '';
        const res = document.getElementById(resultadoId);
        res.textContent = '';
        res.classList.add('hidden');
    }

    function setLoading(btnId, loading, label) {
        const btn = document.getElementById(btnId);
        btn.disabled = loading;
        btn.textContent = loading ? 'Calculando...' : label;
    }

    // PVD — Pós Vendas Digital (48h úteis)
    document.getElementById('btn-process-pvd').addEventListener('click', async () => {
        const dataEfetivacao = document.getElementById('dataEfetivacao').value;
        setLoading('btn-process-pvd', true, 'Verificar');
        try {
            const resultado = await PosVendasService.calcularPVD(dataEfetivacao, new Date());
            mostrarResultado('resultadoPVD', 'erroPVD', resultado);
        } catch (e) {
            document.getElementById('erroPVD').textContent = e.message || 'Erro ao calcular.';
        } finally {
            setLoading('btn-process-pvd', false, 'Verificar');
        }
    });

    document.getElementById('btn-reset-pvd').addEventListener('click', () => {
        limpar(['dataEfetivacao'], 'erroPVD', 'resultadoPVD');
    });

    // CPV — Caso Pós Vendas (50 dias úteis)
    document.getElementById('btn-process-cpv').addEventListener('click', async () => {
        const dataAbertura = document.getElementById('dataAbertura').value;
        const numeroCaso   = document.getElementById('numeroCaso').value;
        setLoading('btn-process-cpv', true, 'Verificar');
        try {
            const resultado = await PosVendasService.calcularCPV(dataAbertura, numeroCaso, new Date());
            mostrarResultado('resultadoCPV', 'erroCPV', resultado);
        } catch (e) {
            document.getElementById('erroCPV').textContent = e.message || 'Erro ao calcular.';
        } finally {
            setLoading('btn-process-cpv', false, 'Verificar');
        }
    });

    document.getElementById('btn-reset-cpv').addEventListener('click', () => {
        limpar(['dataAbertura', 'numeroCaso'], 'erroCPV', 'resultadoCPV');
    });

    // DV — Divergência na Venda (90 dias corridos)
    document.getElementById('btn-process-dv').addEventListener('click', () => {
        const dataAbertura = document.getElementById('dataAberturaDV').value;
        const numeroCaso   = document.getElementById('numeroCasoDV').value;
        try {
            const resultado = PosVendasService.calcularDV(dataAbertura, numeroCaso, new Date());
            mostrarResultado('resultadoDV', 'erroDV', resultado);
        } catch (e) {
            document.getElementById('erroDV').textContent = e.message || 'Erro ao calcular.';
        }
    });

    document.getElementById('btn-reset-dv').addEventListener('click', () => {
        limpar(['dataAberturaDV', 'numeroCasoDV'], 'erroDV', 'resultadoDV');
    });

}());
