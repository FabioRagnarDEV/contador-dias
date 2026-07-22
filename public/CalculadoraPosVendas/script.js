document.addEventListener('DOMContentLoaded', () => {

    const tabs = {
        pvd: document.getElementById('pvd'),
        cpv: document.getElementById('cpv'),
        dv:  document.getElementById('dv')
    };

    const btnShow = {
        pvd: document.getElementById('btn-show-pvd'),
        cpv: document.getElementById('btn-show-cpv'),
        dv:  document.getElementById('btn-show-dv')
    };

    function mostrarTab(id) {
        Object.keys(tabs).forEach(k => {
            tabs[k].classList.add('hidden');
            btnShow[k].classList.remove('active');
        });
        tabs[id].classList.remove('hidden');
        btnShow[id].classList.add('active');
    }

    btnShow.pvd.addEventListener('click', () => mostrarTab('pvd'));
    btnShow.cpv.addEventListener('click', () => mostrarTab('cpv'));
    btnShow.dv.addEventListener('click',  () => mostrarTab('dv'));

    function mostrarResultado(elId, erroId, resultado) {
        const el   = document.getElementById(elId);
        const erro = document.getElementById(erroId);
        erro.textContent = '';

        if (resultado.erro) {
            erro.textContent = resultado.erro;
            el.classList.add('hidden');
            return;
        }

        el.className = `text-center mt-2 text-base font-semibold p-4 rounded-lg resultado-box transition-all ${resultado.corFundo} ${resultado.corTexto}`;
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

    // PVD
    document.getElementById('btn-process-pvd').addEventListener('click', async () => {
        const dataEfetivacao = document.getElementById('dataEfetivacao').value;
        const btn = document.getElementById('btn-process-pvd');
        btn.disabled = true;
        btn.textContent = 'Calculando...';
        try {
            const resultado = await PosVendasService.calcularPVD(dataEfetivacao, new Date());
            mostrarResultado('resultadoPVD', 'erroPVD', resultado);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Verificar';
        }
    });

    document.getElementById('btn-reset-pvd').addEventListener('click', () => {
        limpar(['dataEfetivacao'], 'erroPVD', 'resultadoPVD');
    });

    // CPV
    document.getElementById('btn-process-cpv').addEventListener('click', async () => {
        const dataAbertura = document.getElementById('dataAbertura').value;
        const numeroCaso   = document.getElementById('numeroCaso').value;
        const btn = document.getElementById('btn-process-cpv');
        btn.disabled = true;
        btn.textContent = 'Calculando...';
        try {
            const resultado = await PosVendasService.calcularCPV(dataAbertura, numeroCaso, new Date());
            mostrarResultado('resultadoCPV', 'erroCPV', resultado);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Verificar';
        }
    });

    document.getElementById('btn-reset-cpv').addEventListener('click', () => {
        limpar(['dataAbertura', 'numeroCaso'], 'erroCPV', 'resultadoCPV');
    });

    // DV
    document.getElementById('btn-process-dv').addEventListener('click', () => {
        const dataAbertura = document.getElementById('dataAberturaDV').value;
        const numeroCaso   = document.getElementById('numeroCasoDV').value;
        const resultado    = PosVendasService.calcularDV(dataAbertura, numeroCaso, new Date());
        mostrarResultado('resultadoDV', 'erroDV', resultado);
    });

    document.getElementById('btn-reset-dv').addEventListener('click', () => {
        limpar(['dataAberturaDV', 'numeroCasoDV'], 'erroDV', 'resultadoDV');
    });

});
