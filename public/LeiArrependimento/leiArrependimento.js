// ─── Referências DOM ──────────────────────────────────────────────────────────

const dataPagamentoInput  = document.getElementById('data-pagamento');
const calcularBtn         = document.getElementById('calcular-btn');
const zerarBtn            = document.getElementById('zerar-btn');
const mensagemErroDiv     = document.getElementById('mensagem-erro');

const resultadoCard       = document.getElementById('resultado-card');
const resultadoTopo       = document.getElementById('resultado-topo');
const resultadoIcone      = document.getElementById('resultado-icone');
const resultadoTitulo     = document.getElementById('resultado-titulo');
const resultadoDescricao  = document.getElementById('resultado-descricao');
const alertaFds           = document.getElementById('alerta-fds');
const alertaFdsTexto      = document.getElementById('alerta-fds-texto');
const contagemBtn         = document.getElementById('contagem-btn');
const timelineContainer   = document.getElementById('timeline-container');
const timelineDias        = document.getElementById('timeline-dias');


// ─── Utilitários ──────────────────────────────────────────────────────────────

function mascaraData(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 8);
    if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{2})/, '$1/$2');
    input.value = v;
}

function esconderResultado() {
    resultadoCard.classList.remove('visible');
    timelineContainer.classList.add('hidden');
    timelineDias.innerHTML = '';
    alertaFds.classList.add('hidden');
    mensagemErroDiv.textContent = '';
}


// ─── Cálculo principal ────────────────────────────────────────────────────────

function calcularPrazo() {
    mensagemErroDiv.textContent = '';
    esconderResultado();

    const dataAtual = new Date();
    dataAtual.setHours(0, 0, 0, 0);

    const resultado = LeiArrependimentoService.calcularPrazo(dataPagamentoInput.value, dataAtual);

    if (resultado.erro) {
        mensagemErroDiv.textContent = resultado.erro;
        return;
    }

    renderizarResultado(resultado);
}


// ─── Renderização do resultado ────────────────────────────────────────────────

function renderizarResultado(resultado) {
    const nomeUsuario = localStorage.getItem('nomeUsuario');
    const prefixo     = nomeUsuario ? `${nomeUsuario}, ` : '';

    // Cores e classes por estado
    if (resultado.estaNoPrazo) {
        resultadoTopo.className      = 'p-5 flex items-center gap-4 bg-green-50';
        resultadoTitulo.className    = 'text-lg font-extrabold leading-tight text-green-800';
        resultadoDescricao.className = 'text-sm font-medium opacity-90 mt-0.5 text-green-700';
        resultadoIcone.textContent   = '✅';
        resultadoTitulo.textContent  = `${prefixo}ainda está no prazo!`;
    } else {
        resultadoTopo.className      = 'p-5 flex items-center gap-4 bg-red-50';
        resultadoTitulo.className    = 'text-lg font-extrabold leading-tight text-red-800';
        resultadoDescricao.className = 'text-sm font-medium opacity-90 mt-0.5 text-red-600';
        resultadoIcone.textContent   = '❌';
        resultadoTitulo.textContent  = `${prefixo}o prazo já expirou.`;
    }

    resultadoDescricao.textContent = resultado.descricao;

    // Alerta de fim de semana
    if (resultado.isFimDeSemana) {
        alertaFdsTexto.textContent = `⚠️ Atenção: o dia ${resultado.prazoFinalFormatado} é um ${resultado.nomeDiaFimSemana}. Favor verificar com seu líder/madrinha imediata para verificar exceção.`;
        alertaFds.classList.remove('hidden');
    } else {
        alertaFds.classList.add('hidden');
    }

    // Aplica tema no botão de contagem
    const tema = window._tema;
    if (tema) {
        contagemBtn.className = `w-full text-white py-2.5 px-5 rounded-xl font-bold text-sm btn-3d flex items-center justify-center gap-2 bg-gradient-to-br ${tema.btn.join(' ')}`;
    }

    // Exibe o card com animação
    resultadoCard.classList.add('visible');
    resultadoIcone.classList.add('pulse-once');
    setTimeout(() => resultadoIcone.classList.remove('pulse-once'), 600);
}


// ─── Timeline dos 7 dias ──────────────────────────────────────────────────────

function mostrarContagem() {
    mensagemErroDiv.textContent = '';

    const contagem = LeiArrependimentoService.gerarContagemDias(dataPagamentoInput.value);
    if (!contagem) {
        mensagemErroDiv.textContent = 'Insira uma data válida primeiro para ver a contagem.';
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    timelineDias.innerHTML = '';

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    contagem.forEach((dia, idx) => {
        const card = document.createElement('div');
        card.style.animationDelay = `${idx * 60}ms`;

        // Determina estado visual do dia
        const dataDodia = new Date(dataPagamentoInput.value.split('/').reverse().join('-') + 'T00:00:00');
        dataDodia.setDate(dataDodia.getDate() + idx);
        const jaPassou  = hoje > dataDodia;
        const ehHoje    = hoje.toDateString() === dataDodia.toDateString();

        let bgClasse, textClasse, badgeHtml, bordaClasse;

        if (dia.isUltimoDia && dia.isFimDeSemana) {
            bgClasse    = 'bg-amber-50';
            textClasse  = 'text-amber-800';
            bordaClasse = 'border-l-4 border-amber-400';
            badgeHtml   = `<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">⚠️ ${dia.nomeDia}</span>`;
        } else if (dia.isUltimoDia) {
            bgClasse    = 'bg-red-50';
            textClasse  = 'text-red-800';
            bordaClasse = 'border-l-4 border-red-400';
            badgeHtml   = `<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800">Prazo Final</span>`;
        } else if (ehHoje) {
            bgClasse    = 'bg-blue-50';
            textClasse  = 'text-blue-800';
            bordaClasse = 'border-l-4 border-blue-400';
            badgeHtml   = `<span class="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">Hoje</span>`;
        } else if (jaPassou) {
            bgClasse    = 'bg-slate-50';
            textClasse  = 'text-slate-400';
            bordaClasse = 'border-l-4 border-slate-200';
            badgeHtml   = `<span class="text-xs font-semibold text-slate-400">✓ passado</span>`;
        } else {
            bgClasse    = 'bg-white';
            textClasse  = 'text-slate-700';
            bordaClasse = 'border-l-4 border-slate-300';
            badgeHtml   = '';
        }

        card.className = `day-card ${bgClasse} ${bordaClasse} rounded-xl p-3 flex items-center justify-between shadow-sm`;

        // Número do dia
        const numDiv = document.createElement('div');
        numDiv.className = 'flex items-center gap-3';

        const circulo = document.createElement('div');
        circulo.className = `w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${dia.isUltimoDia ? 'bg-red-500 text-white' : ehHoje ? 'bg-blue-500 text-white' : jaPassou ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-600'}`;
        circulo.textContent = dia.diaNumero;

        const textoDiv = document.createElement('div');
        const diaLabel = document.createElement('p');
        diaLabel.className = `text-xs font-bold uppercase tracking-wide ${textClasse}`;
        diaLabel.textContent = `Dia ${dia.diaNumero}${dia.isUltimoDia ? ' — Prazo Final' : ''}`;

        const dataLabel = document.createElement('p');
        dataLabel.className = `text-sm font-semibold ${textClasse}`;
        // Capitaliza o texto da data
        dataLabel.textContent = dia.dataTexto.charAt(0).toUpperCase() + dia.dataTexto.slice(1);

        textoDiv.appendChild(diaLabel);
        textoDiv.appendChild(dataLabel);
        numDiv.appendChild(circulo);
        numDiv.appendChild(textoDiv);

        // Badge lateral
        const badgeDiv = document.createElement('div');
        badgeDiv.innerHTML = badgeHtml;

        card.appendChild(numDiv);
        card.appendChild(badgeDiv);
        timelineDias.appendChild(card);
    });

    timelineContainer.classList.remove('hidden');

    // Scroll suave até a timeline
    setTimeout(() => {
        timelineContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}


// ─── Zerar ────────────────────────────────────────────────────────────────────

function zerarCalculadora() {
    dataPagamentoInput.value = '';
    esconderResultado();
    dataPagamentoInput.focus();
}


// ─── Event Listeners ──────────────────────────────────────────────────────────

calcularBtn.addEventListener('click', calcularPrazo);
zerarBtn.addEventListener('click', zerarCalculadora);
contagemBtn.addEventListener('click', mostrarContagem);

dataPagamentoInput.addEventListener('input', () => mascaraData(dataPagamentoInput));
dataPagamentoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') calcularPrazo();
});
