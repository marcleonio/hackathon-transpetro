package com.hackathonbrasil.transpetro.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.apache.commons.math3.stat.regression.OLSMultipleLinearRegression;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.exceptions.misusing.PotentialStubbingProblem;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hackathonbrasil.transpetro.model.CleaningSuggestionDto;
import com.hackathonbrasil.transpetro.model.DailyPredictionDto;

@ExtendWith(MockitoExtension.class)
public class PredictionServiceTest {

    @InjectMocks
    private PredictionService predictionService;

    @Mock
    private ModelService modelService;

    @Mock
    private OLSMultipleLinearRegression trainedModelMock;

    // ====================================================================
    // DADOS FIXOS DO CENÁRIO DE TESTE
    // Usaremos valores arbitrários para Intercepto e Taxa de Degradação Global
    // ====================================================================

    private static final int MAX_PROJECTION_DAYS = 180;

    private static final double CFI_LIMPO_BRUNO_LIMA = 10.35436345;

    // Coeficientes Globais (Mockados do OLS)
    private static final double INTERCEPTO_GLOBAL_B0 = 1.050000; // HPI base para X=0
    private static final double TAXA_DEGRADACAO_B1 = 0.000678; // Coeficiente para Dias Desde Limpeza

    // Data de Referência (Última Docagem)
    private static final LocalDate DATA_ULTIMA_LIMPEZA = LocalDate.of(2025, 11, 29);
    private static final String NAVIO_ID = "BRUNO LIMA";

    private static final Double CFI_LIMPO_PADRAO = 25.0;


    @BeforeEach
    public void setup() {
        // --- MOCKANDO O MODELSERVICE (Usando métodos globais e CFI específico) ---

        // 1. Mocka o CFI Específico do navio
        lenient().when(modelService.getCfiCleanTonPerDay(NAVIO_ID)).thenReturn(CFI_LIMPO_BRUNO_LIMA);

        // 2. Mocka a Data Base de Limpeza
        lenient().when(modelService.getLastCleaningDate(NAVIO_ID)).thenReturn(DATA_ULTIMA_LIMPEZA);

        // 3. Mocka os Coeficientes GLOBAIS do OLS
        lenient().when(modelService.getModelIntercept()).thenReturn(INTERCEPTO_GLOBAL_B0);
        lenient().when(modelService.getDegradationRate()).thenReturn(TAXA_DEGRADACAO_B1);

        // O HPI Inicial será assumido como o INTERCEPTO_GLOBAL_B0 para fins de teste,
        // pois estamos ignorando TRIM e Deslocamento (assumindo que são zero).

        // A data de limpeza sempre deve ser mockada para o navio de teste.
        lenient().when(modelService.getLastCleaningDate(NAVIO_ID)).thenReturn(DATA_ULTIMA_LIMPEZA);

        // --- MOCKS DO MODELO OLS ---
        // 1. Mocka o retorno do modelo treinado
        lenient().when(modelService.getTrainedModel()).thenReturn(trainedModelMock);

        // 2. Mocka o retorno dos Coeficientes da Regressão (Simulando o resultado do treino)
        lenient().when(trainedModelMock.estimateRegressionParameters()).thenReturn(new double[]{
            INTERCEPTO_GLOBAL_B0, // 0: Intercepto (HPI Base)
            TAXA_DEGRADACAO_B1,   // 1: Taxa de Degradação (Dias Desde Limpeza)
            0.001,                // 2: TRIM
            0.000002              // 3: Deslocamento
        });
    }

    // ====================================================================
    // TESTE PRINCIPAL: GERAÇÃO DA SUGESTÃO DE LIMPEZA
    // ====================================================================

    @Test
    void suggestCleaningDateDeveRetornarDtoComPrevisoesPara180Dias() {
        // ACT
        CleaningSuggestionDto suggestionDto = predictionService.suggestCleaningDate(NAVIO_ID);

        // ASSERT
        assertNotNull(suggestionDto, "O DTO de sugestão não deve ser nulo.");

        // Verifica o tamanho da lista de previsões diárias
        List<DailyPredictionDto> predictions = suggestionDto.getPredictions();
        assertEquals(MAX_PROJECTION_DAYS, predictions.size(), "O número de previsões deve ser igual a 180.");

        // ====================================================================
        // VALIDAÇÕES DE CÁLCULO
        // ====================================================================

        // 1. Validação do HPI no Dia 0 (Assume que HPI Inicial é o Intercepto)
        DailyPredictionDto diaZero = predictions.get(0);

        // O HPI no dia 0 deve ser o Intercepto (B0), pois Dias=0.
        assertEquals(INTERCEPTO_GLOBAL_B0, diaZero.getHpi(), 0.00001, "O HPI do Dia 0 deve ser o Intercepto Global.");

        // Consumo Extra no Dia 0
        double consumoExtraDiaZeroEsperado = CFI_LIMPO_BRUNO_LIMA * (INTERCEPTO_GLOBAL_B0 - 1.0);
        assertEquals(consumoExtraDiaZeroEsperado, diaZero.getExtraFuelTonPerDay(), 0.0001, "Consumo Extra no Dia 0 deve ser calculado corretamente.");

        // 2. Validação do HPI no Último Dia (Dia 179)
        int diasAposInicio = MAX_PROJECTION_DAYS - 1; // 179
        DailyPredictionDto ultimoDia = predictions.get(diasAposInicio);

        // HPI Esperado: B0 + (B1 * Dias)
        double hpiEsperadoUltimoDia = INTERCEPTO_GLOBAL_B0 + (TAXA_DEGRADACAO_B1 * diasAposInicio);

        assertEquals(DATA_ULTIMA_LIMPEZA.plusDays(diasAposInicio), ultimoDia.getData(), "A data do último dia deve estar correta.");
        assertEquals(hpiEsperadoUltimoDia, ultimoDia.getHpi(), 0.00001, "O HPI do último dia deve refletir a degradação total.");

        // Consumo Extra Esperado no Último Dia
        double consumoExtraUltimoDiaEsperado = CFI_LIMPO_BRUNO_LIMA * (hpiEsperadoUltimoDia - 1.0);
        assertEquals(consumoExtraUltimoDiaEsperado, ultimoDia.getExtraFuelTonPerDay(), 0.0001, "Consumo Extra no último dia deve ser calculado corretamente.");
    }

    // ====================================================================
    // TESTE DE EXCEÇÃO
    // ====================================================================

    @Test
    void suggestCleaningDateDeveRetornarFallbackDtoQuandoDataLimpezaNula() {
        // ARRANGE: Configura o cenário de FALHA (Dados ausentes/nulos)
        String navioAusente = "Navio Fantasma";

        // 1. Mock do CFI (Pode ser um valor OK, mas a Data de Limpeza é a falha crítica)
        // Se o CFI for o ponto de falha, você mockaria 0.0 aqui.
        lenient().when(modelService.getCfiCleanTonPerDay(navioAusente.toUpperCase())).thenReturn(CFI_LIMPO_PADRAO);

        // 2. Mock da Data de Limpeza (A condição que causa o fallback)
        when(modelService.getLastCleaningDate(navioAusente.toUpperCase())).thenReturn(null);

        // ACT: Executa a sugestão
        CleaningSuggestionDto resultDto = predictionService.suggestCleaningDate(navioAusente);

        // ASSERT: Valida o resultado do Fallback DTO
        assertNotNull(resultDto, "O DTO de retorno não deve ser nulo.");

        // 1. Verifica se a lista de previsões está vazia
        assertTrue(resultDto.getPredictions().isEmpty(), "A lista de previsões deve estar vazia no cenário de fallback.");

        // 2. Verifica se a justificativa (razão do fallback) está correta
        String justificativaEsperada = "Data da última docagem não encontrada para o navio.";
        assertEquals(justificativaEsperada, resultDto.getJustificativa(),
                    "A justificativa do fallback deve indicar a falta da data de docagem.");

        // 3. Verifica se os valores numéricos estão em zero/nulos
        assertEquals(0.0, resultDto.getMaxExtraFuelTonPerDay(), 0.00001,
                    "O consumo extra projetado deve ser 0.0.");
        assertNull(resultDto.getDataIdealLimpeza(), "A data ideal de limpeza deve ser nula.");

        // 4. Verifica o status do casco atual (se essa lógica também é definida no DTO)
        assertEquals("🟢 LIMPO (Sem bioincrustação)", resultDto.getStatusCascoAtual(), "O status deve ser o de fallback.");
    }
}