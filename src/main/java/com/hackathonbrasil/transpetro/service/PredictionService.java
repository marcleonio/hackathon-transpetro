package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.CleaningSuggestionDto;
import com.hackathonbrasil.transpetro.model.DailyPredictionDto;
import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class PredictionService {

    @Autowired
    private ModelService modelService;

    // --- CONSTANTES DE DECISÃO HPI ---
    private static final double HPI_LIMITE_DECISAO = 1.08;
    //dias para gerar e analisar o HPI e o Consumo Extra para os próximos 180 dias (cerca de 6 meses), impede que a degradação para um futuro muito distante
    private static final int MAX_PROJECTION_DAYS = 180;

    private static final double HPI_LEVEL_1_MAX = 1.03;
    private static final double HPI_LEVEL_2_MAX = 1.06;
    private static final double DEFAULT_DEGRADATION_RATE = 0.0005;

    // ... (Métodos adjustCoefficients, getNivelBioincrustacao, getStatusDescricao - MANTIDOS) ...
    private double[] adjustCoefficients(double[] rawCoefficients) {
        // Posições: 0: Intercepto, 1: DiasDesdeLimpeza, 2: TRIM, 3: Deslocamento
        if (rawCoefficients.length < 4) {
            return rawCoefficients;
        }
        double[] adjusted = Arrays.copyOf(rawCoefficients, rawCoefficients.length);

        double betaDays = rawCoefficients[1];
        if (betaDays <= 0) {
            System.out.println("⚠️ WARNING: Coeficiente de Dias Limpeza inválido. Usando taxa padrão.");
            adjusted[1] = DEFAULT_DEGRADATION_RATE;
        }

        double intercept = rawCoefficients[0];
        if (intercept > 1.05) {
            System.out.println("⚠️ WARNING: Intercepto muito alto. Resetando para 1.0.");
            adjusted[0] = 1.0;
        }
        return adjusted;
    }

    private int getNivelBioincrustacao(double hpi) {
        if (hpi >= HPI_LIMITE_DECISAO) {
            return 4;
        } else if (hpi > HPI_LEVEL_2_MAX) {
            return 3;
        } else if (hpi > HPI_LEVEL_1_MAX) {
            return 2;
        } else if (hpi > 1.00) {
            return 1;
        } else {
            return 0;
        }
    }

    private String getStatusDescricao(int nivel) {
        switch (nivel) {
            case 0: return "🟢 LIMPO (Sem bioincrustação)";
            case 1: return "🟡 ATENÇÃO (Microencrustação)";
            case 2: return "🟠 ALERTA (Macroincrustação leve)";
            case 3: return "🔴 CRÍTICO (Macroincrustação moderada)";
            case 4: return "🚨 URGENTE (Macroincrustação pesada)";
            default: return "STATUS DESCONHECIDO";
        }
    }


    // --- MÉTODO PRINCIPAL DE PREVISÃO ---

    public CleaningSuggestionDto suggestCleaningDate(String navioId) {
        navioId = navioId.toString().toUpperCase();

        double cfiCleanTonPerDay = modelService.getCfiCleanTonPerDay(navioId); // OBTÉM CFI CLEAN
        LocalDate ultimaLimpeza = modelService.getLastCleaningDate(navioId);

        if (ultimaLimpeza == null) {
            return buildFallbackDto(navioId, "Data da última docagem não encontrada para o navio.", 1.0, new ArrayList<>(), cfiCleanTonPerDay); // Ajustado para CFI
        }

        OLSMultipleLinearRegression model = modelService.getTrainedModel();
        List<DailyPredictionDto> predictions = new ArrayList<>();
        LocalDate dataIdeal = null;
        double predictedHPI = 0.0;
        double maxExtraFuel = 0.0;

        if (model == null) {
            return buildFallbackDto(navioId, "Modelo de ML não treinado ou indisponível.", 1.0, predictions, cfiCleanTonPerDay); // Ajustado para CFI
        }

        // 2. Obter e AJUSTAR os coeficientes
        double[] rawCoefficients = model.estimateRegressionParameters();

        // 3. Tratamento de coeficientes (Se rawCoefficients.length < 4) - SUA LÓGICA MANTIDA
        if (rawCoefficients.length < 4) {
            double coefDiasFallback = rawCoefficients.length > 1 ? rawCoefficients[1] : DEFAULT_DEGRADATION_RATE;
            double coefAjustado = coefDiasFallback > 0 ? coefDiasFallback : DEFAULT_DEGRADATION_RATE;
            rawCoefficients = new double[] {rawCoefficients[0], coefAjustado, 0.0, 0.0};
        }

        double[] coefficients = adjustCoefficients(rawCoefficients);

        // --- Variáveis de Regressão (Ajustadas) ---
        double intercept = coefficients[0];
        double betaDays = coefficients[1];
        double betaTrim = coefficients[2];
        double betaDeslocamento = coefficients[3];
        double trimFuture = 0.0;
        double deslocamentoFuture = 0.0;

        LocalDate dataHoje = LocalDate.now();
        long daysSinceLastCleaning = ChronoUnit.DAYS.between(ultimaLimpeza, dataHoje);

        // HPI no dia de HOJE (Ponto inicial):
        double initialHPI = intercept
                        + (betaDays * daysSinceLastCleaning)
                        + (betaTrim * trimFuture)
                        + (betaDeslocamento * deslocamentoFuture);

        predictedHPI = Math.max(1.0, initialHPI);

        // --- 3. PONTO INICIAL (HOJE) ---
        // CRIA A PREVISÃO INICIAL, CALCULA AS MÉTRICAS E ADICIONA À LISTA
        DailyPredictionDto initialPrediction = new DailyPredictionDto(dataHoje, predictedHPI,0d,0d);
        calculatePerformanceMetrics(initialPrediction, cfiCleanTonPerDay);
        predictions.add(initialPrediction); // ADICIONADO UMA ÚNICA VEZ
        maxExtraFuel = initialPrediction.getExtraFuelTonPerDay();


        // 4. Simulação e Projeção Diária (Começa a partir de amanhã)
        long maxDays = daysSinceLastCleaning + MAX_PROJECTION_DAYS;

        for (long days = daysSinceLastCleaning + 1; days < maxDays; days++) {
            LocalDate predictionDate = ultimaLimpeza.plusDays(days);

            // --- PREVISÃO DO HPI ---
            double calculatedHPI = intercept + (betaDays * days);
            predictedHPI = Math.max(1.0, calculatedHPI);

            // CRIA, CALCULA MÉTRICAS E ADICIONA À LISTA
            DailyPredictionDto prediction = new DailyPredictionDto(predictionDate, predictedHPI,0d,0d);
            calculatePerformanceMetrics(prediction, cfiCleanTonPerDay);

            predictions.add(prediction);

            if (prediction.getExtraFuelTonPerDay() > maxExtraFuel) {
                maxExtraFuel = prediction.getExtraFuelTonPerDay();
            }

            // --- VERIFICAÇÃO DO LIMITE DE PERFORMANCE ---
            if (dataIdeal == null && predictedHPI >= HPI_LIMITE_DECISAO) {
                dataIdeal = predictionDate;
            }
        }

        // 5. Montagem do DTO Final
        int nivelAtual = getNivelBioincrustacao(initialHPI);
        String statusDescricaoAtual = getStatusDescricao(nivelAtual);

        String justificativa;
        if (dataIdeal != null) {
            justificativa = "HPI projetado atingiu o limite de " + HPI_LIMITE_DECISAO + " na data sugerida.";
        } else {
            justificativa = "HPI projetado (" + String.format("%.2f", predictedHPI) + ") não atingiu o limite dentro de 180 dias de projeção.";
        }

        return new CleaningSuggestionDto(
            navioId,
            dataIdeal,
            justificativa,
            statusDescricaoAtual,
            nivelAtual,
            cfiCleanTonPerDay,
            maxExtraFuel,
            predictions
        );
    }

    // --- Método Auxiliar para Falhas ---
    private CleaningSuggestionDto buildFallbackDto(String navioId, String motivo, double hpi, List<DailyPredictionDto> predictions, double cfiCleanTonPerDay) {
        int nivel = getNivelBioincrustacao(hpi);
        return new CleaningSuggestionDto(
            navioId,
            null,
            motivo,
            getStatusDescricao(nivel),
            nivel,
            cfiCleanTonPerDay,
            0.0,
            predictions
        );
    }

    /**
     * Calcula as métricas de performance (Arrasto Relativo e Consumo Extra)
     * para uma previsão diária específica.
     */
    private void calculatePerformanceMetrics(DailyPredictionDto prediction, double cfiCleanTonPerDay) {
        double hpi = prediction.getHpi();

        // 1. Arrasto Relativo (Relative Drag)
        double dragPercent = (hpi - 1.0) * 100.0;
        prediction.setDragPercent(Math.max(0.0, dragPercent));

        // 2. Consumo Diário Extra de Combustível (Daily Extra Fuel)
        double extraFuelTonPerDay = cfiCleanTonPerDay * (hpi - 1.0);
        prediction.setExtraFuelTonPerDay(Math.max(0.0, extraFuelTonPerDay));
    }
}