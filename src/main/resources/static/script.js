const NAVIO_ID = "Bruno%20lima";
const API_URL = `http://localhost:8080/api/v1/previsao/limpeza-sugerida?navioId=${NAVIO_ID}`;

// Função principal para buscar e processar os dados
async function fetchDataAndDrawCharts() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();

        // 1. Processar dados para os gráficos
        const dates = data.predictions.map(p => {
            // Formata a data para um formato mais legível nos eixos
            return new Date(p.data).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
        });
        const hpiValues = data.predictions.map(p => p.hpi);
        const extraFuelValues = data.predictions.map(p => p.extraFuelTonPerDay);

        // 2. Exibir o sumário
        displaySummary(data);

        // 3. Desenhar Gráficos
        drawHPIChart(dates, hpiValues, data.nivelBioincrustacao);
        drawExtraFuelChart(dates, extraFuelValues, data.cfiCleanTonPerDay);

    } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
        document.getElementById('summary-info').innerHTML = `Erro ao carregar dados: ${error.message}. Certifique-se de que o backend está rodando em localhost:8080.`;
    }
}

// Função para exibir o sumário das informações
function displaySummary(data) {
    const summaryDiv = document.getElementById('summary-info');

    // Calcula o HPI atual (o primeiro ponto da previsão)
    const currentHPI = data.predictions[0].hpi.toFixed(4);
    const currentExtraFuel = data.predictions[0].extraFuelTonPerDay.toFixed(2);
    const dragPercent = (currentHPI - 1) * 100;

    summaryDiv.innerHTML = `
        <h3>Sumário da Análise</h3>
        <p><strong>CFI Limpo (Base Ideal):</strong> ${data.cfiCleanTonPerDay.toFixed(2)} Ton/Dia</p>
        <p><strong>HPI Atual (Início da Projeção):</strong> ${currentHPI} (Arrasto de ${dragPercent.toFixed(2)}%)</p>
        <p><strong>Consumo Extra Atual:</strong> ${currentExtraFuel} Ton/Dia</p>
        <p><strong>Status Casco:</strong> <span id="status-atual">${data.statusCascoAtual}</span></p>
        <p><strong>Limpeza Sugerida:</strong> ${new Date(data.dataIdealLimpeza).toLocaleDateString('pt-BR')} (Motivo: ${data.justificativa})</p>
    `;

    // Adiciona cor de alerta visual (simples)
    if (data.nivelBioincrustacao >= 4) {
        document.getElementById('status-atual').style.color = 'red';
    }
}


// Função para desenhar o Gráfico de HPI
function drawHPIChart(dates, hpiValues, nivelBioincrustacao) {
    const ctx = document.getElementById('hpiChart').getContext('2d');

    // Define a cor da linha de acordo com o Nível de Bioincrustação
    let lineColor = 'rgba(255, 99, 132, 1)'; // Vermelho para URGENTE (Nível 4)
    if (nivelBioincrustacao <= 2) {
        lineColor = 'rgba(75, 192, 192, 1)'; // Verde/Ciano para OK
    } else if (nivelBioincrustacao === 3) {
        lineColor = 'rgba(255, 205, 86, 1)'; // Amarelo/Laranja para Atenção
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'HPI Projetado',
                data: hpiValues,
                borderColor: lineColor,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: false,
                tension: 0.1
            },
            {
                // Linha de referência HPI = 1.0 (Casco Limpo)
                label: 'HPI Ideal (1.0)',
                data: Array(dates.length).fill(1.0),
                borderColor: 'rgba(0, 123, 255, 0.7)',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'HPI (Hull Performance Index)'
                    },
                    min: 1.0 // Garante que 1.0 seja a base
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
    });
}

// Função para desenhar o Gráfico de Consumo Extra
function drawExtraFuelChart(dates, extraFuelValues, cfiClean) {
    const ctx = document.getElementById('extraFuelChart').getContext('2d');

    // Mudar para gráfico de barras para enfatizar os valores diários de custo
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Consumo Extra (Ton/Dia)',
                data: extraFuelValues,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                // Linha de Consumo Total Limpo para Contexto
                label: `CFI Limpo (${cfiClean.toFixed(2)} Ton)`,
                data: Array(dates.length).fill(cfiClean),
                type: 'line',
                borderColor: 'rgba(40, 40, 40, 0.8)',
                borderDash: [8, 4],
                pointRadius: 0,
                fill: false,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Toneladas de Combustível por Dia'
                    },
                    beginAtZero: true
                },
                x: {
                    title: {
                        display: true,
                        text: 'Data'
                    }
                }
            }
        }
    });
}

// Inicia o processo
fetchDataAndDrawCharts();