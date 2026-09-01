(function () {

    let modoGrupo = null;
    let dadosApurados = null;

    let tema = { header: ['from-cyan-500', 'to-teal-500'], btn: ['from-cyan-600', 'to-teal-600'], text: 'text-cyan-600', focus: 'focus:ring-cyan-500', border: 'border-cyan-500', bg: 'bg-cyan-50' };
    const temaSalvo = localStorage.getItem('temaAtivo');
    if (temaSalvo) tema = JSON.parse(temaSalvo);

    document.getElementById('header').classList.add('bg-gradient-to-r', ...tema.header);
    document.getElementById('abrir-instrucoes-btn').classList.add('bg-gradient-to-br', ...tema.btn);
    document.getElementById('aviso-box').classList.add(tema.text.replace('600', '800'), tema.border, tema.bg);

    const nome   = localStorage.getItem('nomeUsuario');
    const genero = localStorage.getItem('generoUsuario');
    const saudEl = document.getElementById('saudacao-usuario');
    if (nome) {
        const bv = genero === 'M' ? 'Bem-vindo de volta.' : genero === 'F' ? 'Bem-vinda de volta.' : 'Bem-vindo(a) de volta.';
        saudEl.textContent = 'Olá, ';
        const span = document.createElement('span');
        span.className = 'font-bold ' + tema.text;
        span.textContent = nome;
        saudEl.appendChild(span);
        saudEl.appendChild(document.createTextNode('! ' + bv));
    } else {
        saudEl.textContent = 'Apure os números de sorteio da assembleia.';
    }
    setTimeout(() => saudEl.classList.add('show'), 100);

    function selecionarGrupo(modo) {
        modoGrupo = modo;
        dadosApurados = null;
        ['btn-ate1000', 'btn-acima1000'].forEach(id => {
            document.getElementById(id).classList.remove('border-green-500', 'bg-green-50');
            document.getElementById(id).classList.add('border-slate-200', 'bg-white');
        });
        const sel = document.getElementById(modo === 'ate1000' ? 'btn-ate1000' : 'btn-acima1000');
        sel.classList.remove('border-slate-200', 'bg-white');
        sel.classList.add('border-green-500', 'bg-green-50');
        gerarInputsPremios();
        document.getElementById('formulario').classList.remove('hidden');
        document.getElementById('resultado').classList.add('hidden');
        document.getElementById('mensagem-erro').textContent = '';
        document.getElementById('aviso-participantes').classList.add('hidden');
        document.getElementById('num-participantes').value = '';
    }

    document.getElementById('btn-ate1000').addEventListener('click', () => selecionarGrupo('ate1000'));
    document.getElementById('btn-acima1000').addEventListener('click', () => selecionarGrupo('acima1000'));

    function gerarInputsPremios() {
        const container = document.getElementById('inputs-premios');
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-3';
            div.innerHTML = `
                <span class="text-xs font-bold text-slate-500 w-14 flex-shrink-0">${i}º prêmio</span>
                <input type="text" id="premio-${i}" maxlength="5" inputmode="numeric"
                    class="w-full border border-slate-300 rounded-lg p-3 focus:outline-none ${tema.focus} font-mono text-lg tracking-widest text-center"
                    placeholder="00000" />`;
            container.appendChild(div);
        }
        for (let i = 1; i <= 5; i++) {
            document.getElementById(`premio-${i}`).addEventListener('keydown', e => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const next = document.getElementById(`premio-${i + 1}`);
                if (next) next.focus(); else document.getElementById('btn-apurar').focus();
            });
        }
    }

    document.getElementById('num-participantes').addEventListener('input', function () {
        const v = parseInt(this.value);
        const aviso = document.getElementById('aviso-participantes');
        if (!v) { aviso.classList.add('hidden'); return; }
        if (modoGrupo === 'ate1000' && v > 1000) {
            aviso.textContent = 'Para grupos até 1.000, informe entre 1 e 1.000.';
            aviso.classList.remove('hidden');
        } else if (modoGrupo === 'acima1000' && v <= 1000) {
            aviso.textContent = 'Para grupos acima de 1.000, informe maior que 1.000.';
            aviso.classList.remove('hidden');
        } else if (modoGrupo === 'acima1000' && v > 10000) {
            aviso.textContent = 'O máximo suportado é 10.000 participantes.';
            aviso.classList.remove('hidden');
        } else {
            aviso.classList.add('hidden');
        }
    });

    document.getElementById('btn-apurar').addEventListener('click', apurar);
    document.getElementById('btn-limpar').addEventListener('click', limpar);

    function apurar() {
        const erroEl = document.getElementById('mensagem-erro');
        erroEl.textContent = '';
        const maxPart = parseInt(document.getElementById('num-participantes').value);
        if (!maxPart || maxPart < 1) { erroEl.textContent = 'Informe o número máximo de participantes do grupo.'; return; }
        const premios = [];
        for (let i = 1; i <= 5; i++) {
            const val = document.getElementById(`premio-${i}`).value.replace(/\D/g, '');
            if (!val || val.length !== 5) { erroEl.textContent = `O ${i}º prêmio deve ter exatamente 5 dígitos.`; return; }
            premios.push(parseInt(val));
        }
        if (modoGrupo === 'ate1000') {
            if (maxPart > 1000) { erroEl.textContent = 'Máximo de participantes deve ser ≤ 1.000.'; return; }
            dadosApurados = ApuracaoService.apurarCentenas(premios, maxPart);
            mostrarAnimacao(() => renderCentenas(dadosApurados));
        } else {
            if (maxPart <= 1000 || maxPart > 10000) { erroEl.textContent = 'Informe entre 1.001 e 10.000.'; return; }
            dadosApurados = ApuracaoService.apurarMilhares(premios, maxPart);
            mostrarAnimacao(() => renderMilhares(dadosApurados));
        }
    }

    function limpar() {
        document.getElementById('num-participantes').value = '';
        document.getElementById('mensagem-erro').textContent = '';
        document.getElementById('aviso-participantes').classList.add('hidden');
        document.getElementById('resultado').classList.add('hidden');
        document.getElementById('resultado-cota').classList.add('hidden');
        document.getElementById('input-cota-sorteio').value = '';
        for (let i = 1; i <= 5; i++) { const el = document.getElementById(`premio-${i}`); if (el) el.value = ''; }
        dadosApurados = null;
        const first = document.getElementById('premio-1');
        if (first) first.focus();
    }

    function mostrarAnimacao(callback) {
        const overlay  = document.getElementById('anim-overlay');
        const reelsRow = document.getElementById('reels-row');
        reelsRow.innerHTML = '';
        for (let r = 0; r < 4; r++) {
            const reel = document.createElement('div');
            reel.className = 'digit-reel';
            const inner = document.createElement('div');
            inner.className = 'digit-reel-inner';
            for (let rep = 0; rep < 2; rep++) {
                for (let d = 0; d <= 9; d++) {
                    const span = document.createElement('span');
                    span.textContent = d;
                    inner.appendChild(span);
                }
            }
            reel.appendChild(inner);
            reelsRow.appendChild(reel);
        }
        overlay.classList.add('active');
        const drum = document.getElementById('drum-el');
        drum.style.animationDuration = '0.4s';
        setTimeout(() => { drum.style.animationDuration = '0.8s'; }, 800);
        setTimeout(() => { drum.style.animationDuration = '1.4s'; }, 1400);
        setTimeout(() => { overlay.classList.remove('active'); setTimeout(callback, 300); }, 2200);
    }

    function criarBadge(texto, classe, label, subLabel) {
        const wrap = document.createElement('div');
        wrap.className = 'flex flex-col items-center gap-0.5';
        const span = document.createElement('span');
        span.className = 'centena-badge ' + classe;
        span.textContent = texto;
        const lbl = document.createElement('span');
        lbl.className = 'text-[10px] text-slate-400';
        lbl.textContent = label;
        const frm = document.createElement('span');
        frm.className = 'text-[9px] text-slate-300';
        frm.textContent = subLabel;
        wrap.appendChild(span); wrap.appendChild(lbl); wrap.appendChild(frm);
        return wrap;
    }

    function criarBlocoPremioCentenas(p, dados) {
        const nomesPremios    = ['1º', '2º', '3º', '4º', '5º'];
        const formacoesLabel  = ['3°4°5°', '2°3°4°', '1°2°3°'];
        const bloco = document.createElement('div');
        bloco.className = 'border border-slate-200 rounded-xl overflow-hidden';
        const hdr = document.createElement('div');
        hdr.className = 'bg-slate-100 px-4 py-2';
        hdr.innerHTML = `<span class="text-xs font-bold text-slate-600">${nomesPremios[p]} prêmio</span>`;
        const corpo = document.createElement('div');
        corpo.className = 'px-4 py-3 flex flex-wrap gap-2 items-center';
        for (let c = 0; c < 3; c++) {
            const idx  = p * 3 + c;
            const item = dados.resultado[idx];
            const cl   = item.excluida ? 'centena-excluida' : item.isPrincipal ? 'centena-principal' : 'centena-reserva';
            const lbl  = item.isPrincipal ? '★ Principal' : item.excluida ? 'Excluída' : `Reserva ${idx}`;
            corpo.appendChild(criarBadge(item.centena, cl, lbl, formacoesLabel[c]));
            if (c < 2) { const sep = document.createElement('span'); sep.className = 'text-slate-300 text-sm self-start mt-2'; sep.textContent = '·'; corpo.appendChild(sep); }
        }
        bloco.appendChild(hdr); bloco.appendChild(corpo);
        return bloco;
    }

    function criarBlocoPremioMilhares(p, dados) {
        const nomesPremios   = ['1º', '2º', '3º', '4º', '5º'];
        const formacoesLabel = ['2°3°4°5°', '1°2°3°4°'];
        const bloco = document.createElement('div');
        bloco.className = 'border border-slate-200 rounded-xl overflow-hidden';
        const hdr = document.createElement('div');
        hdr.className = 'bg-slate-100 px-4 py-2';
        hdr.innerHTML = `<span class="text-xs font-bold text-slate-600">${nomesPremios[p]} prêmio</span>`;
        const corpo = document.createElement('div');
        corpo.className = 'px-4 py-3 flex flex-wrap gap-2 items-center';
        for (let m = 0; m < 2; m++) {
            const idx  = p * 2 + m;
            const item = dados.resultado[idx];
            const cl   = item.excluida ? 'centena-excluida' : item.isPrincipal ? 'centena-principal' : 'centena-reserva';
            let lbl    = item.isPrincipal ? '★ Principal' : item.excluida ? 'Excluído' : `Reserva ${idx}`;
            if (item.reduzido) lbl += ` (−${dados.maxParticipantes})`;
            const sub  = item.reduzido ? `${item.milharOriginal} − ${dados.maxParticipantes}` : formacoesLabel[m];
            corpo.appendChild(criarBadge(item.milhar, cl, lbl, sub));
            if (m < 1) { const sep = document.createElement('span'); sep.className = 'text-slate-300 text-sm self-start mt-2'; sep.textContent = '·'; corpo.appendChild(sep); }
        }
        bloco.appendChild(hdr); bloco.appendChild(corpo);
        return bloco;
    }

    function resetValidacaoCota() {
        document.getElementById('resultado-cota').classList.add('hidden');
        document.getElementById('input-cota-sorteio').value = '';
        document.getElementById('btn-validar-cota').classList.add('bg-gradient-to-br', ...tema.btn);
        document.getElementById('input-cota-sorteio').classList.add(tema.focus);
    }

    function renderCentenas(dados) {
        const res = document.getElementById('resultado');
        res.classList.remove('hidden');
        res.classList.add('fade-in');

        document.getElementById('badge-tipo').textContent = 'Até 1.000 participantes · Centenas';
        document.getElementById('badge-tipo').className = 'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700';

        const excluidas = dados.resultado.filter(r => r.excluida);
        const infoExcl  = document.getElementById('info-exclusao');
        if (excluidas.length > 0) {
            infoExcl.textContent = `Exclusão (§3°): centenas com cota acima de ${dados.maxParticipantes} são inválidas — ${excluidas.length} excluída(s).`;
            infoExcl.classList.remove('hidden');
        } else {
            infoExcl.classList.add('hidden');
        }
        document.getElementById('info-adicionais').classList.add('hidden');

        const tabela = document.getElementById('tabela-resultado');
        tabela.innerHTML = '';
        for (let p = 0; p < 5; p++) tabela.appendChild(criarBlocoPremioCentenas(p, dados));

        const d = dados.desempate;
        document.getElementById('desempate-numero').textContent = d.centena;
        document.getElementById('desempate-passos').classList.add('hidden');
        document.getElementById('desempate-desc').textContent = d.origemTexto + ' — referência para desempate de lances iguais.';

        resetValidacaoCota();
        res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function renderMilhares(dados) {
        const res = document.getElementById('resultado');
        res.classList.remove('hidden');
        res.classList.add('fade-in');

        document.getElementById('badge-tipo').textContent = 'Acima de 1.000 participantes · Milhares';
        document.getElementById('badge-tipo').className = 'ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700';

        const infoExcl = document.getElementById('info-exclusao');
        const infoAd   = document.getElementById('info-adicionais');

        if (dados.temExclusao) {
            const n = dados.resultado.filter(r => r.excluida).length;
            infoExcl.textContent = `Exclusão (§3°): milhares com cota acima de ${dados.maxParticipantes} são inválidos — ${n} excluído(s).`;
            infoExcl.classList.remove('hidden');
        } else { infoExcl.classList.add('hidden'); }

        if (dados.temAdicionais) {
            infoAd.textContent = `Números adicionais (§4°): cada cota concorre com mais ${dados.vezes} número(s) adicional(is) — soma da cota + múltiplos de ${dados.maxParticipantes}.`;
            infoAd.classList.remove('hidden');
        } else { infoAd.classList.add('hidden'); }

        const tabela = document.getElementById('tabela-resultado');
        tabela.innerHTML = '';
        for (let p = 0; p < 5; p++) tabela.appendChild(criarBlocoPremioMilhares(p, dados));

        const desempate = dados.desempate;
        document.getElementById('desempate-numero').textContent = desempate.numero;
        const passosEl = document.getElementById('desempate-passos');

        if (desempate.tipo === 'subtracao' && desempate.passos.length > 1) {
            passosEl.classList.remove('hidden');
            passosEl.innerHTML = desempate.passos.map((p, i) => {
                if (i === 0) return `<span class="text-slate-400">Bruto: <strong>${p}</strong></span>`;
                const ant  = desempate.passos[i - 1];
                const last = i === desempate.passos.length - 1;
                return `<span class="${last ? 'text-violet-700 font-bold' : 'text-slate-400'}">${ant} − ${dados.maxParticipantes} = <strong>${p}</strong>${last ? ' ✓' : ''}</span>`;
            }).join('<br>');
            document.getElementById('desempate-desc').textContent = `${desempate.origemTexto} — reduzido por subtração sucessiva de ${dados.maxParticipantes} até ficar dentro do limite.`;
        } else {
            passosEl.classList.add('hidden');
            document.getElementById('desempate-desc').textContent = desempate.origemTexto + ' — referência para desempate de lances iguais.';
        }

        resetValidacaoCota();
        res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validarCota() {
        if (!dadosApurados) return;
        const cotaInput = parseInt(document.getElementById('input-cota-sorteio').value);
        const resultEl  = document.getElementById('resultado-cota');

        document.querySelectorAll('.badge-contemplada, .badge-found').forEach(el => {
            el.classList.remove('badge-contemplada', 'badge-found');
        });

        if (!cotaInput || cotaInput < 1) {
            resultEl.className = 'rounded-xl p-4 space-y-1 fade-in bg-amber-50 border border-amber-300';
            resultEl.innerHTML = '<p class="text-sm font-semibold text-amber-700">Informe o número da cota contemplada.</p>';
            resultEl.classList.remove('hidden');
            return;
        }

        const max  = dadosApurados.maxParticipantes;
        const tipo = dadosApurados.tipo;

        document.querySelectorAll('#tabela-resultado .centena-badge').forEach(el => {
            el.classList.add('scanning');
            setTimeout(() => el.classList.remove('scanning'), 2000);
        });

        setTimeout(() => {
            const cotaStr = tipo === 'centenas'
                ? (cotaInput === 1000 ? '000' : String(cotaInput % 1000).padStart(3, '0'))
                : (cotaInput === 10000 ? '0000' : String(cotaInput).padStart(4, '0'));

            let encontrado = null;
            let ordemLabel = '';
            dadosApurados.resultado.forEach((item, i) => {
                const val = tipo === 'centenas' ? item.centena : item.milhar;
                if (val === cotaStr && !encontrado) {
                    encontrado = item;
                    ordemLabel = item.isPrincipal
                        ? (tipo === 'centenas' ? 'centena principal' : 'milhar principal')
                        : `${i + 1}ª ${tipo === 'centenas' ? 'centena' : 'milhar'} (reserva)`;
                }
            });

            if (encontrado) {
                document.querySelectorAll('#tabela-resultado .centena-badge').forEach(el => {
                    const val = tipo === 'centenas' ? encontrado.centena : encontrado.milhar;
                    if (el.textContent.trim() === val) {
                        el.classList.add('badge-contemplada');
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            }

            if (cotaInput > max) {
                resultEl.className = 'rounded-xl p-4 space-y-2 fade-in bg-red-50 border border-red-300';
                resultEl.innerHTML = `
                    <p class="text-sm font-bold text-red-700">❌ Cota ${cotaInput} não habilitada</p>
                    <p class="text-xs text-red-600">A cota ${cotaInput} excede o número máximo de participantes (${max}).</p>`;

            } else if (encontrado && !encontrado.excluida) {
                resultEl.className = 'rounded-xl p-4 space-y-2 fade-in bg-green-50 border border-green-400';
                resultEl.innerHTML = `
                    <p class="text-sm font-bold text-green-700">✅ Cota <span class="bg-yellow-200 text-yellow-900 px-1.5 py-0.5 rounded font-mono">${cotaInput}</span> saiu diretamente na extração</p>
                    <p class="text-xs text-green-600">Correspondeu à <strong>${ordemLabel}</strong>. A cota estava dentro do limite e habilitada para o sorteio.</p>`;

            } else if (encontrado && encontrado.excluida) {
                resultEl.className = 'rounded-xl p-4 space-y-2 fade-in bg-amber-50 border border-amber-400';
                resultEl.innerHTML = `
                    <p class="text-sm font-bold text-amber-700">⚠️ Cota <span class="bg-yellow-200 text-yellow-900 px-1.5 py-0.5 rounded font-mono">${cotaInput}</span> excluída</p>
                    <p class="text-xs text-amber-600">Correspondeu à <strong>${ordemLabel}</strong>, mas foi excluída por ultrapassar o máximo (${max}).</p>`;

            } else {
                const numDesempate = parseInt(dadosApurados.desempate.numero || dadosApurados.desempate.centena);
                const pad = n => String(n).padStart(tipo === 'centenas' ? 3 : 4, '0');
                const passos = [];
                let offset = 1;
                let achou  = false;
                while (offset <= max && !achou) {
                    const acima  = numDesempate + offset;
                    const abaixo = numDesempate - offset;
                    if (acima <= max)  { passos.push({ valor: acima,  dir: `+${offset}` }); if (acima  === cotaInput) { achou = true; break; } }
                    if (abaixo >= 1)   { passos.push({ valor: abaixo, dir: `-${offset}` }); if (abaixo === cotaInput) { achou = true; break; } }
                    offset++;
                }
                const MAX_EX = 10;
                const exibir = passos.slice(0, MAX_EX);
                let passosHtml = `<div class="font-mono text-xs space-y-1 mt-2 border border-slate-200 rounded-lg p-3 bg-white">`;
                passosHtml += `<p class="text-slate-500 mb-2">Busca a partir do desempate <strong class="text-slate-700">${pad(numDesempate)}</strong>:</p>`;
                exibir.forEach(p => {
                    const ok = p.valor === cotaInput;
                    passosHtml += `<div class="flex items-center gap-2 ${ok ? 'font-bold text-green-700' : 'text-slate-500'}">
                        <span class="w-12 text-right">${p.dir}</span><span>→</span>
                        <span class="${ok ? 'bg-yellow-200 px-1.5 rounded text-yellow-900' : ''}">${pad(p.valor)}</span>
                        ${ok ? '<span class="text-green-600 text-xs">✓ Cota contemplada</span>' : ''}
                    </div>`;
                });
                if (passos.length > MAX_EX) passosHtml += `<p class="text-slate-400 text-xs mt-1">... e mais ${passos.length - MAX_EX} tentativas.</p>`;
                passosHtml += `</div>`;

                resultEl.className = 'rounded-xl p-4 space-y-2 fade-in bg-blue-50 border border-blue-400';
                resultEl.innerHTML = `
                    <p class="text-sm font-bold text-blue-700">🔍 Cota <span class="bg-yellow-200 text-yellow-900 px-1.5 py-0.5 rounded font-mono">${cotaInput}</span> localizada por busca alternada</p>
                    <p class="text-xs text-blue-600">Não saiu diretamente na extração. Localizada após <strong>${passos.length}</strong> tentativa(s) a partir do desempate <strong>${pad(numDesempate)}</strong>.</p>
                    ${passosHtml}`;
            }

            resultEl.classList.remove('hidden');
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 2000);
    }

    document.getElementById('btn-validar-cota').addEventListener('click', validarCota);
    document.getElementById('input-cota-sorteio').addEventListener('keydown', e => { if (e.key === 'Enter') validarCota(); });

    const modal     = document.getElementById('modal-instrucoes');
    const abrirBtn  = document.getElementById('abrir-instrucoes-btn');
    const fecharBtn = document.getElementById('fechar-instrucoes-btn');
    let ultimoFoco  = null;

    abrirBtn.addEventListener('click', () => {
        ultimoFoco = document.activeElement;
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
        setTimeout(() => fecharBtn.focus(), 20);
    });
    const fecharModal = () => {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 300);
        if (ultimoFoco) ultimoFoco.focus();
    };
    fecharBtn.addEventListener('click', fecharModal);
    modal.addEventListener('click', e => { if (e.target === modal) fecharModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) fecharModal(); });

    document.getElementById('btn-apurar').classList.add('bg-gradient-to-br', ...tema.btn);

}());
