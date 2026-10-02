document.addEventListener('DOMContentLoaded', () => {

    // Paleta de temas — sincronizada com o painel principal
    const paletaDeTemas = [
        { name: "Oceanic Teal",    header: ["from-cyan-500",    "to-teal-500"],    btn: ["from-cyan-600",    "to-teal-600"],    text: "text-cyan-600",    focus: "focus:border-cyan-500",    iconBg: "bg-cyan-100"    },
        { name: "Sunset Orange",   header: ["from-amber-500",   "to-orange-600"],  btn: ["from-amber-600",   "to-orange-700"],  text: "text-amber-600",   focus: "focus:border-amber-500",   iconBg: "bg-amber-100"   },
        { name: "Grape Soda",      header: ["from-fuchsia-500", "to-purple-600"],  btn: ["from-fuchsia-600", "to-purple-700"],  text: "text-fuchsia-600", focus: "focus:border-fuchsia-500", iconBg: "bg-fuchsia-100" },
        { name: "Jungle Lime",     header: ["from-lime-400",    "to-emerald-600"], btn: ["from-lime-500",    "to-emerald-700"], text: "text-lime-500",    focus: "focus:border-lime-500",    iconBg: "bg-lime-100"    },
        { name: "Hot Pink",        header: ["from-pink-500",    "to-rose-500"],    btn: ["from-pink-600",    "to-rose-600"],    text: "text-pink-600",    focus: "focus:border-pink-500",    iconBg: "bg-pink-100"    },
        { name: "Deep Sky",        header: ["from-sky-500",     "to-indigo-600"],  btn: ["from-sky-600",     "to-indigo-700"],  text: "text-sky-600",     focus: "focus:border-sky-500",     iconBg: "bg-sky-100"     },
        { name: "Burning Sunset",  header: ["from-red-500",     "to-orange-500"],  btn: ["from-red-600",     "to-orange-600"],  text: "text-red-600",     focus: "focus:border-red-500",     iconBg: "bg-red-100"     },
        { name: "Minty Fresh",     header: ["from-green-300",   "to-cyan-400"],    btn: ["from-green-400",   "to-cyan-500"],    text: "text-green-500",   focus: "focus:border-green-500",   iconBg: "bg-green-100"   },
        { name: "Cyberpunk Night", header: ["from-indigo-500",  "to-fuchsia-500"], btn: ["from-indigo-600",  "to-fuchsia-600"], text: "text-indigo-500",  focus: "focus:border-indigo-500",  iconBg: "bg-indigo-100"  },
    ];

    // Carrega o tema salvo no localStorage (mesmo usado pelo painel principal)
    let tema = paletaDeTemas[0];
    try {
        const temaSalvo = localStorage.getItem('temaAtivo');
        if (temaSalvo) tema = JSON.parse(temaSalvo);
    } catch (_) {}

    // Aplica o tema nos elementos da página
    document.getElementById('header').classList.add('bg-gradient-to-r', ...tema.header);
    document.getElementById('calcular-btn').classList.add('bg-gradient-to-br', ...tema.btn);
    document.getElementById('abrir-instrucoes-btn').classList.add('bg-gradient-to-br', ...tema.btn);
    document.getElementById('data-aprovacao').classList.add(tema.focus);
    document.getElementById('icon-bg').classList.add(tema.iconBg);


    // Saudação personalizada pelo nome/gênero do usuário e horário do dia
    const nomeUsuario   = localStorage.getItem('nomeUsuario');
    const generoUsuario = localStorage.getItem('generoUsuario');
    const saudacaoEl    = document.getElementById('saudacao-usuario');

    const obterSaudacaoDoDia = () => {
        const hora = new Date().getHours();
        if (hora >= 5  && hora < 12) return 'Bom dia';
        if (hora >= 12 && hora < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    if (nomeUsuario) {
        const saudacao   = obterSaudacaoDoDia();
        const boasVindas = generoUsuario === 'F' ? 'Seja bem-vinda.' : 'Seja bem-vindo.';
        saudacaoEl.textContent = `${saudacao}, `;
        const spanNome = document.createElement('span');
        spanNome.className = `font-bold ${tema.text}`;
        spanNome.textContent = nomeUsuario;
        saudacaoEl.appendChild(spanNome);
        saudacaoEl.appendChild(document.createTextNode(`! ${boasVindas}`));
    } else {
        saudacaoEl.textContent = 'Verifique a validade do laudo de vistoria.';
    }
    setTimeout(() => saudacaoEl.classList.add('show'), 100);


    // Modal de instruções
    const modal = document.getElementById('modal-instrucoes');
    const abrirBtn = document.getElementById('abrir-instrucoes-btn');
    const fecharBtn = document.getElementById('fechar-instrucoes-btn');
    let ultimoFoco = null;

    const capturarTabNoModal = (e) => {
        if (e.key !== 'Tab') return;
        const focaveis = modal.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focaveis.length) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
    };

    const abrirModal = () => {
        ultimoFoco = document.activeElement;
        modal.classList.remove('hidden');
        abrirBtn.setAttribute('aria-expanded', 'true');
        setTimeout(() => { modal.classList.add('active'); fecharBtn.focus(); }, 10);
        document.addEventListener('keydown', capturarTabNoModal);
    };

    const fecharModal = () => {
        modal.classList.remove('active');
        abrirBtn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('keydown', capturarTabNoModal);
        setTimeout(() => modal.classList.add('hidden'), 300);
        if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
    };

    abrirBtn.addEventListener('click', abrirModal);
    fecharBtn.addEventListener('click', fecharModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) fecharModal();
    });


    // Máscara de data (DD/MM/AAAA)
    const inputData = document.getElementById('data-aprovacao');

    inputData.addEventListener('input', () => {
        let v = inputData.value.replace(/\D/g, '');
        if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1/$2');
        if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
        inputData.value = v;
    });

    inputData.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('calcular-btn').click();
    });


    // Renderiza o card de resultado com base no retorno do LaudoService
    function renderizarResultado(resultado, dataAprovacaoStr) {
        const card            = document.getElementById('resultado-card');
        const topo            = document.getElementById('resultado-topo');
        const iconeWrapper    = document.getElementById('resultado-icone-wrapper');
        const titulo          = document.getElementById('resultado-titulo');
        const descricao       = document.getElementById('resultado-descricao');
        const timelineFill    = document.getElementById('timeline-fill');
        const timelineLabel   = document.getElementById('timeline-label');
        const dataAprovacaoDisplay = document.getElementById('data-aprovacao-display');
        const dataValidadeDisplay  = document.getElementById('data-validade-display');
        const diasNumero      = document.getElementById('dias-numero');
        const diasLabelTop    = document.getElementById('dias-label-top');
        const diasLabelBottom = document.getElementById('dias-label-bottom');
        const diasCard        = document.getElementById('dias-restantes-card');
        const alertaCtx       = document.getElementById('alerta-contexto');

        // Prefixo com o nome do usuário, se disponível
        const prefixoNome = nomeUsuario ? `${nomeUsuario}, ` : '';

        card.classList.remove('visible');

        if (resultado.valido) {
            const diasPassados  = resultado.diasPassados;
            const diasRestantes = 45 - diasPassados;
            const pct           = Math.min((diasPassados / 45) * 100, 100);
            const urgente       = diasRestantes <= 7;

            topo.className      = 'p-5 flex items-center gap-4 bg-green-50';
            titulo.className    = 'text-lg font-extrabold leading-tight text-green-800';
            descricao.className = 'text-sm font-medium opacity-90 mt-0.5 text-green-700';

            iconeWrapper.textContent = urgente ? '⚠️' : '✅';
            titulo.textContent       = urgente
                ? `${prefixoNome}atenção: prazo quase no fim!`
                : `${prefixoNome}laudo dentro do prazo!`;
            descricao.textContent    = `Válido até ${resultado.dataValidadeFormatada}`;

            timelineFill.style.background = urgente ? '#f59e0b' : '#22c55e';
            timelineFill.style.width = '0%';
            setTimeout(() => { timelineFill.style.width = pct + '%'; }, 50);
            timelineLabel.textContent = `${diasPassados} de 45 dias decorridos`;

            diasCard.className = urgente
                ? 'rounded-xl p-3 border border-amber-200 bg-amber-50'
                : 'rounded-xl p-3 border border-green-200 bg-green-50';
            diasLabelTop.className = `text-[10px] font-bold uppercase mb-1 ${urgente ? 'text-amber-500' : 'text-green-500'}`;
            diasLabelTop.textContent = 'Restam';
            diasNumero.className = `text-2xl font-black ${urgente ? 'text-amber-600' : 'text-green-600'}`;
            diasNumero.textContent = diasRestantes;
            diasLabelBottom.className = `text-[10px] font-semibold uppercase ${urgente ? 'text-amber-400' : 'text-green-400'}`;
            diasLabelBottom.textContent = diasRestantes === 1 ? 'DIA' : 'DIAS';

            if (urgente) {
                alertaCtx.className   = 'rounded-xl p-4 text-sm font-medium border bg-amber-50 border-amber-200 text-amber-800';
                alertaCtx.textContent = `⚠️ Atenção${nomeUsuario ? `, ${nomeUsuario}` : ''}! Restam apenas ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} para o vencimento. Providencie a renovação com urgência.`;
                alertaCtx.classList.remove('hidden');
            } else {
                alertaCtx.classList.add('hidden');
            }

        } else {
            const diasVencidos = resultado.diasVencidos;

            topo.className      = 'p-5 flex items-center gap-4 bg-red-50';
            titulo.className    = 'text-lg font-extrabold leading-tight text-red-800';
            descricao.className = 'text-sm font-medium opacity-90 mt-0.5 text-red-600';

            // Sorteia uma mensagem engraçada aleatória a cada verificação
            const mensagensEngracadas = resultado.listaMensagens;
            const indiceAleatorio     = Math.floor(Math.random() * mensagensEngracadas.length);
            const mensagemSorteada    = mensagensEngracadas[indiceAleatorio];

            iconeWrapper.textContent = '❌';
            titulo.textContent       = nomeUsuario
                ? `${nomeUsuario}... ${mensagemSorteada}`
                : mensagemSorteada;
            descricao.textContent    = `Expirou em ${resultado.dataValidadeFormatada}`;

            timelineFill.style.background = '#ef4444';
            timelineFill.style.width = '0%';
            setTimeout(() => { timelineFill.style.width = '100%'; }, 50);
            timelineLabel.textContent = `Vencido há ${diasVencidos} dia${diasVencidos !== 1 ? 's' : ''}`;

            diasCard.className        = 'rounded-xl p-3 border border-red-200 bg-red-50';
            diasLabelTop.className    = 'text-[10px] font-bold uppercase mb-1 text-red-500';
            diasLabelTop.textContent  = 'Vencido';
            diasNumero.className      = 'text-2xl font-black text-red-600';
            diasNumero.textContent    = diasVencidos;
            diasLabelBottom.className = 'text-[10px] font-semibold uppercase text-red-400';
            diasLabelBottom.textContent = diasVencidos === 1 ? 'DIA' : 'DIAS';

            alertaCtx.className   = 'rounded-xl p-4 text-sm font-medium border bg-red-50 border-red-200 text-red-800';
            alertaCtx.textContent = `❌ ${prefixoNome}o laudo expirou há ${diasVencidos} dia${diasVencidos !== 1 ? 's' : ''}. É necessária a realização de uma nova vistoria para prosseguir com o processo.`;
            alertaCtx.classList.remove('hidden');
        }

        dataAprovacaoDisplay.textContent = dataAprovacaoStr;
        dataValidadeDisplay.textContent  = resultado.dataValidadeFormatada;

        // Exibe o card com animação e pulsa o ícone
        setTimeout(() => {
            card.classList.add('visible');
            iconeWrapper.classList.add('pulse-once');
            setTimeout(() => iconeWrapper.classList.remove('pulse-once'), 600);
        }, 50);
    }


    // Evento: Verificar validade
    document.getElementById('calcular-btn').addEventListener('click', () => {
        const erroEl = document.getElementById('mensagem-erro');
        erroEl.textContent = '';

        const dataAtual = new Date();
        dataAtual.setHours(0, 0, 0, 0);

        const resultado = LaudoService.verificarValidade(inputData.value, dataAtual);

        if (resultado.erro) {
            erroEl.textContent = resultado.erro;
            document.getElementById('resultado-card').classList.remove('visible');
            return;
        }

        renderizarResultado(resultado, inputData.value);
    });


    // Evento: Zerar campos
    document.getElementById('reset-btn').addEventListener('click', () => {
        inputData.value = '';
        document.getElementById('mensagem-erro').textContent = '';
        document.getElementById('resultado-card').classList.remove('visible');
        inputData.focus();
    });

});
