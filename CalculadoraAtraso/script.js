document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    //                    1. REFERÊNCIAS GERAIS
    // ==========================================================================
    const btnCalcular = document.getElementById('calcular-btn');
    const btnReset = document.getElementById('reset-btn');
    const inputDataVencimento = document.getElementById('data-vencimento');
    const inputParcelas = document.getElementById('numero-parcelas');
    const boxResultado = document.getElementById('resultado');
    const boxErro = document.getElementById('mensagem-erro');
    const btnAbrirDev = document.getElementById('btnAbrirDevolucao');
    const modalDevolucao = document.getElementById('modalDevolucao');
    const btnFecharDev = document.getElementById('btnFecharDevolucao');
    const btnCalcDev = document.getElementById('btnCalcularDevolucao');
    const btnLimparDev = document.getElementById('btnLimparDevolucao');
    const btnToggleMem = document.getElementById('btnToggleMemoria');
    const devCredito = document.getElementById('dev-credito');
    const devPercentual = document.getElementById('dev-percentual');
    const devValorPago = document.getElementById('dev-valorPago');
    const checkDescontemplacao = document.getElementById('checkDescontemplacao');
    const boxDescontemplacao = document.getElementById('boxDescontemplacao');
    const devCreditoGrupo = document.getElementById('dev-credito-grupo');
    const devCreditoCliente = document.getElementById('dev-credito-cliente');
    const devResultadoBox = document.getElementById('dev-resultado');

    // ==========================================================================
    //                 2. MANUAL DE UTILIZAÇÃO
    // ==========================================================================
    const manualConteudo = document.getElementById('manual-conteudo');
    if (manualConteudo) {
        manualConteudo.innerHTML = `
            <div class="space-y-6 text-justify text-sm leading-relaxed text-slate-700">
                
                <div class="border-b border-gray-200 pb-4">
                    <h4 class="font-bold text-lg text-slate-900 mb-2">1. Como realizar a Análise de Atraso</h4>
                    <p class="mb-2">Preencha os campos para identificar o risco atual da cota:</p>
                    <ul class="list-disc pl-5 space-y-1 mb-2">
                        <li><strong>Status:</strong> Defina se o cliente já retirou o bem (Contemplado) ou não.</li>
                        <li><strong>Data de Inauguração:</strong> Fundamental para definir a regra de cancelamento (veja abaixo).</li>
                        <li><strong>Vencimento:</strong> Data da parcela mais antiga em aberto.</li>
                        <li><strong>Nº Parcelas:</strong> Quantidade total de parcelas pendentes.</li>
                    </ul>
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                        <span class="font-bold text-blue-800">Resultado:</span> O sistema informará se é caso de cobrança simples, cancelamento ou busca e apreensão (Para cotas com o crédito pago).
                    </div>
                </div>

                <div class="border-b border-gray-200 pb-4">
                    <h4 class="font-bold text-lg text-slate-900 mb-2">2. Regras de Cancelamento (Cláusula 39)</h4>
                    <p class="mb-2">O sistema identifica automaticamente se a cota está em processo de exclusão baseando-se na data do grupo:</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div class="bg-gray-100 p-3 rounded-lg">
                            <p class="font-bold text-gray-800">Grupos até 30/06/2024</p>
                            <p class="text-xs mt-1">Cancelamento com <strong class="text-red-600">2 parcelas</strong> em atraso (consecutivas ou não).</p>
                        </div>
                        <div class="bg-gray-100 p-3 rounded-lg">
                            <p class="font-bold text-gray-800">Grupos após 01/07/2024</p>
                            <p class="text-xs mt-1">Cancelamento com <strong class="text-red-600">3 parcelas</strong> em atraso (consecutivas ou não).</p>
                        </div>
                    </div>
                </div>

                <div class="border-b border-gray-200 pb-4">
                    <h4 class="font-bold text-lg text-slate-900 mb-2">3. Simulador para Devolução</h4>
                    <p class="mb-2">Quando a análise identificar que a cota atingiu os critérios de cancelamento (Ex: Não Contemplada com 3 parcelas), aparecerá um botão: <strong class="text-red-600">"⚠️ Cota cancelou?"</strong>.</p>
                    
                    <p class="mb-2 font-semibold">Como é calculado o valor a devolver?</p>
                    <ul class="list-disc pl-5 space-y-1 text-xs">
                        <li><strong>Base de Cálculo:</strong> Apenas o Fundo Comum pago (exclui Taxa Adm. e Seguro).</li>
                        <li><strong>Multa 1 (Cláusula 41.1):</strong> 10% fixo sobre o Fundo Comum (Prejuízo ao Grupo).</li>
                        <li><strong>Multa 2 (Cláusula 42 - Penal):</strong> Escalonada conforme o percentual pago:
                            <ul class="list-none pl-2 mt-1 border-l-2 border-slate-300">
                                <li>• Até 20% pago: 20% multa</li>
                                <li>• 20,1% a 40%: 15% multa</li>
                                <li>• 40,1% a 50%: 10% multa</li>
                                <li>• Acima de 50%: Isento</li>
                            </ul>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-lg text-slate-900 mb-2">4. Diferença de Descontemplação</h4>
                    <p class="mb-2 text-xs">Aplica-se a cotas <strong>Contempladas com Crédito Pendente</strong> que foram canceladas.</p>
                    <p class="mb-2">No simulador, marque a opção <em>"A cota estava Contemplada?"</em>. O cálculo segue o <strong>Parágrafo 15</strong> da seção de Cancelamento da Contemplação:</p>
                    <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 font-mono text-xs">
                        Diferença = Crédito Atualizado do Grupo - (Crédito do Cliente + Rendimentos)
                    </div>
                    <p class="mt-2 text-xs">Se o crédito atual do grupo for maior, o consorciado deve pagar essa diferença para recompor o saldo do grupo.</p>
                </div>
            </div>
        `;
    }

    //                           --- (LEGISLAÇÃO) ---
    const accordionContainer = document.getElementById('accordion-container');
    if (accordionContainer) {
        accordionContainer.innerHTML = `
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleDevAccordion(this)">
                    Fundo Comum e Base Legal (Lei 11.795) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p>É a parte da parcela destinada à compra do bem (Art. 25). É o único valor passível de devolução ao excluído (Art. 30, Lei 11.795/08).</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleDevAccordion(this)">
                    Por que taxas não são devolvidas? (Cláusula 41) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p>A Taxa de Administração, Fundo de Reserva e Seguro remuneram serviços já prestados e a proteção usufruída durante a vigência do contrato, não sendo reembolsáveis.</p>
                </div>
            </div>
            <div class="accordion-item">
                <button class="accordion-header" onclick="toggleDevAccordion(this)">
                    Entenda as Multas (Cláusulas 41.1 e 42) <span>▼</span>
                </button>
                <div class="accordion-content">
                    <p><strong>Cláusula 41.1 (10%):</strong> Indenização pelos prejuízos causados ao grupo com a saída antecipada.<br>
                    <strong>Cláusula 42 (Penal):</strong> Penalidade compensatória variável (0% a 20%) para cobrir custos de venda e comissão.</p>
                </div>
            </div>
        `;
    }

    // ==========================================================================
    //                     3. UTILITÁRIOS 
    // ==========================================================================

    // Máscara para personalizar a data
    if (inputDataVencimento) {
        inputDataVencimento.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, '$1/$2');
            if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            e.target.value = v;
        });
    }

    // Máscara para personalizar a moeda estilo brazuca
    window.maskCurrency = function(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace(".", ",");
        value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        e.target.value = value;
    };
    if(devCredito) devCredito.addEventListener('input', maskCurrency);
    if(devValorPago) devValorPago.addEventListener('input', maskCurrency);
    if(devCreditoGrupo) devCreditoGrupo.addEventListener('input', maskCurrency);
    if(devCreditoCliente) devCreditoCliente.addEventListener('input', maskCurrency);


    // ==========================================================================
    //              4. LÓGICA DA CALCULADORA DE ATRASO
    // ==========================================================================

    function calcularAtraso() {
        boxErro.textContent = '';
        boxResultado.style.opacity = '0';

        // 1. Obter Inputs
        const dataVencimentoStr = inputDataVencimento.value;
        const parcelas = parseInt(inputParcelas.value);
        let status = 'nao-contemplado';
        const statusRadio = document.querySelector('input[name="status-consorciado"]:checked');
        if (statusRadio) status = statusRadio.value;
        
        // Data de Inauguração do grupo (Aqui vai definir a regra do cancelamento)
        const isInauguracaoAntiga = document.getElementById('data-ate-jun24').checked;

        if (dataVencimentoStr.length !== 10) {
            boxErro.textContent = 'Informe uma data válida (DD/MM/AAAA).';
            return;
        }
        if (!parcelas || parcelas < 1) {
            boxErro.textContent = 'Informe o número de parcelas em aberto.';
            return;
        }

        const partesData = dataVencimentoStr.split('/');
        const dataVencimento = new Date(partesData[2], partesData[1] - 1, partesData[0]);
        const hoje = new Date();
        const diferencaTempo = hoje - dataVencimento;
        const diasAtraso = Math.floor(diferencaTempo / (1000 * 60 * 60 * 24));

        if (diasAtraso < 1) {
            boxErro.textContent = 'A data de vencimento não indica atraso.';
            return;
        }

//             Lógica de Análise de Risco
        let mensagem = '';
        let corTexto = '';
        let acao = '';

        if (status === 'contemplado') {
            // --- CONTEMPLADO (Bem Entregue) ---
            if (diasAtraso > 15 || parcelas >= 2) {
                mensagem = `🚨 <strong>RISCO JURÍDICO IMEDIATO!</strong><br>Cliente contemplado com ${diasAtraso} dias de atraso e ${parcelas} parcela(s).`;
                acao = "Encaminhar para Jurídico/Cobrança urgente. Risco iminente de Busca e Apreensão.";
                corTexto = 'text-red-600';
            } else {
                mensagem = `⚠️ <strong>Atenção:</strong> Cliente contemplado em atraso (${diasAtraso} dias).`;
                acao = "Realizar cobrança preventiva. Negociar pagamento imediato para evitar perda do bem.";
                corTexto = 'text-orange-600';
            }
        } else {
            // --- NÃO CONTEMPLADO (ou Crédito Pendente) ---
            // Define limite baseado na data de inauguração do grupo (Cláusula 39)
            const limiteCancelamento = isInauguracaoAntiga ? 2 : 3;
            
            if (parcelas >= limiteCancelamento) {
                const regraTexto = isInauguracaoAntiga ? "2 parcelas (Grupos até 06/24)" : "3 parcelas (Grupos pós 07/24)";
                mensagem = `🚫 <strong>COTA EM PROCESSO DE CANCELAMENTO</strong><br>Atingiu o limite de ${regraTexto}.`;
                acao = "A cota será excluída por inadimplência conforme Cláusula 39. Verifique abaixo o cálculo estimado de devolução.";
                corTexto = 'text-red-700';
            } else {
                mensagem = `ℹ️ <strong>Cobrança Administrativa</strong><br>${diasAtraso} dias de atraso.`;
                acao = `Emitir boleto atualizado. O cancelamento ocorrerá automaticamente se atingir ${isInauguracaoAntiga ? '2' : '3'} parcelas vencidas.`;
                corTexto = 'text-blue-600';
            }
        }

        boxResultado.innerHTML = `
            <div class="${corTexto} font-bold mb-2 text-xl">${mensagem}</div>
            <div class="text-slate-600 mt-2 text-sm">${acao}</div>
        `;
        boxResultado.style.opacity = '1';

        // Aqui vai verificar se deve exibir botão de Devolução
        verificarBotaoDevolucao(status, parcelas, isInauguracaoAntiga);
    }

    function verificarBotaoDevolucao(status, parcelas, isAntigo) {
        const limite = isAntigo ? 2 : 3;
        
        // Exibe o botão se as regras anteriores forem atendidas.
        if (status === 'nao-contemplado' && parcelas >= limite) {
            btnAbrirDev.style.display = 'inline-block';
            
            btnAbrirDev.style.opacity = '0';
            btnAbrirDev.style.transform = 'translateY(10px)';
            setTimeout(() => {
                btnAbrirDev.style.transition = 'all 0.5s ease';
                btnAbrirDev.style.opacity = '1';
                btnAbrirDev.style.transform = 'translateY(0)';
            }, 100);
        } else {
            btnAbrirDev.style.display = 'none';
        }
    }

    if (btnCalcular) btnCalcular.addEventListener('click', calcularAtraso);

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            inputDataVencimento.value = '';
            inputParcelas.value = '';
            boxResultado.style.opacity = '0';
            btnAbrirDev.style.display = 'none';
        });
    }

    // ==========================================================================
    //          5. LÓGICA DE DEVOLUÇÃO E CÁLCULOS
    // ==========================================================================
    // Descontemplação (com bem pendente)
    if (checkDescontemplacao) {
        checkDescontemplacao.addEventListener('change', (e) => {
            if (e.target.checked) {
                boxDescontemplacao.classList.remove('hidden');
            } else {
                boxDescontemplacao.classList.add('hidden');
                document.getElementById('res-descontemplacao').classList.add('hidden');
            }
        });
    }

    btnAbrirDev.addEventListener('click', (e) => { e.preventDefault(); modalDevolucao.style.display = 'flex'; });
    const fecharModalFunc = () => { modalDevolucao.style.display = 'none'; };
    btnFecharDev.addEventListener('click', fecharModalFunc);
    window.addEventListener('click', (e) => { if (e.target === modalDevolucao) fecharModalFunc(); });

    if (btnToggleMem) {
        btnToggleMem.addEventListener('click', () => {
            const memDiv = document.getElementById('memoriaCalculo');
            memDiv.classList.toggle('hidden');
            btnToggleMem.innerHTML = memDiv.classList.contains('hidden') ? 'Ver Memória de Cálculo ▼' : 'Ocultar Memória ▲';
        });
    }

    // Acordeão
    window.toggleDevAccordion = function(header) {
        const content = header.nextElementSibling;
        const arrow = header.querySelector('span');
        document.querySelectorAll('.accordion-content').forEach(c => { if(c !== content) c.classList.remove('open'); });
        
        if (content.classList.contains('open')) {
            content.classList.remove('open');
            arrow.innerText = '▼';
        } else {
            content.classList.add('open');
            arrow.innerText = '▲';
        }
    };

    if (btnCalcDev) {
        btnCalcDev.addEventListener('click', () => {
            try {
                const credito = parseFloat((devCredito.value || '0').replace(/\./g, '').replace(',', '.'));
                const percentual = parseFloat((devPercentual.value || '0').replace(',', '.'));
                const valorTotalPago = parseFloat((devValorPago.value || '0').replace(/\./g, '').replace(',', '.'));

                if (credito === 0 || percentual === 0 || valorTotalPago === 0) {
                    alert("Por favor, preencha todos os campos da simulação.");
                    return;
                }

                const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                //  CÁLCULO DE DESCONTEMPLAÇÃO (DIFERENÇA DE CRÉDITO)
                if (checkDescontemplacao.checked) {
                    const credGrupo = parseFloat((devCreditoGrupo.value || '0').replace(/\./g, '').replace(',', '.'));
                    const credCliente = parseFloat((devCreditoCliente.value || '0').replace(/\./g, '').replace(',', '.'));
                    
                    if (credGrupo > 0 && credCliente > 0) {
                        const diferenca = credGrupo - credCliente;
                        const resDiv = document.getElementById('res-descontemplacao');
                        const valSpan = document.getElementById('val-descontemplacao');
                        
                        if (diferenca > 0) {
                            resDiv.classList.remove('hidden');
                            resDiv.className = "mb-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 text-sm font-bold block";
                            resDiv.innerHTML = `Diferença a Pagar (Descontemplação):<br><span class="text-lg">${fmt(diferenca)}</span>`;
                        } else {
                            resDiv.classList.remove('hidden');
                            resDiv.className = "mb-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-200 text-sm font-bold block";
                            resDiv.innerHTML = "Sem diferença a pagar (Crédito do cliente cobre o valor atual).";
                        }
                    }
                } else {
                    document.getElementById('res-descontemplacao').classList.add('hidden');
                }

                // 2. CÁLCULO DE DEVOLUÇÃO [Aproximado (pois será conforme contemplação)] - LEI 11.795
                // Base: Fundo Comum
                const valorFundoComum = credito * (percentual / 100);
                
                // Taxas não reembolsáveis
                let valorTaxasRetidas = valorTotalPago - valorFundoComum;
                if(valorTaxasRetidas < 0) valorTaxasRetidas = 0;

                // Multa Cláusula 41.1 (10% Fixo)
                const multaGrupo = valorFundoComum * 0.10;

                // Multa Cláusula 42 (Penal Compensatória)
                let taxaPenal = 0;
                if (percentual <= 20) taxaPenal = 0.20;
                else if (percentual <= 40) taxaPenal = 0.15;
                else if (percentual <= 50) taxaPenal = 0.10;
                else taxaPenal = 0.00; // > 50%
                
                const multaPenal = valorFundoComum * taxaPenal;

                // Valor Líquido
                const devolucao = valorFundoComum - multaGrupo - multaPenal;

                document.getElementById('dev-valorFinal').textContent = fmt(devolucao);
                document.getElementById('memTotalPago').textContent = fmt(valorTotalPago);
                document.getElementById('memTaxasRetidas').textContent = '- ' + fmt(valorTaxasRetidas);
                document.getElementById('memFundoComum').textContent = fmt(valorFundoComum);
                document.getElementById('memValorClausula41').textContent = '- ' + fmt(multaGrupo);
                document.getElementById('memTaxaClausula42').textContent = (taxaPenal * 100) + '%';
                document.getElementById('memValorClausula42').textContent = '- ' + fmt(multaPenal);
                document.getElementById('memTotal').textContent = fmt(devolucao);

                // Exibir Resultado
                devResultadoBox.style.display = 'block';
                devResultadoBox.style.opacity = '0';
                setTimeout(() => devResultadoBox.style.opacity = '1', 50);

            } catch (e) {
                console.error(e);
                alert("Erro ao calcular. Verifique se os números estão no formato correto (ex: 1.000,00).");
            }
        });
    }

    if (btnLimparDev) {
        btnLimparDev.addEventListener('click', () => {
            document.querySelectorAll('.dev-input').forEach(i => i.value = '');
            devResultadoBox.style.display = 'none';
            document.getElementById('res-descontemplacao').classList.add('hidden');
            if(checkDescontemplacao) {
                checkDescontemplacao.checked = false;
                boxDescontemplacao.classList.add('hidden');
            }
        });
    }

});