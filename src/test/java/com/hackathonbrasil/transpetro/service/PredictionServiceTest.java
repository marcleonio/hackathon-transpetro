package com.hackathonbrasil.transpetro.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
  private static final double INTERCEPTO_GLOBAL_B0 = 1.010000; // HPI base para X=0
  private static final double TAXA_DEGRADACAO_B1 = 0.000678; // Coeficiente para Dias Desde Limpeza

  private static final double INTERCEPTO_SUCESSO = 1.010000; // Começa limpo (1% de perda)
  private static final double TAXA_DEGRADACAO_LENTA = 0.000010; // Taxa muito baixa

  // Data de Referência (Última Docagem)
  private static final LocalDate DATA_ULTIMA_LIMPEZA = LocalDate.of(2025, 11, 29);
  private static final String NAVIO_ID = "BRUNO LIMA";

  private static final Double CFI_LIMPO_PADRAO = 25.0;

  // ====================================================================
  // DADOS ESPECÍFICOS PARA ESTE TESTE DE VALIDAÇÃO DE DATA
  // ====================================================================
  // A taxa de degradação B1 deve ser ajustada para atingir o limite no Dia 150.
  private static final double TAXA_DEGRADACAO_VALIDACAO = 0.000167; // Atinge 1.025 em ~150 dias
  private static final double INTERCEPTO_PARA_VALIDACAO = 1.000000; // Começa em HPI 1.000
  private static final double LIMITE_HPI_CRITICO = 1.025000; // Gatilho para Limpeza Reativa

  // OBS: O seu código de produção (PredictionService.java) deve ter uma constante
  // LIMITE_HPI_CRITICO
  // e retornar a data do PRIMEIRO dia em que o HPI for MAIOR OU IGUAL a esse
  // limite.

  @BeforeEach
  public void setup() {
    // --- MOCKANDO O MODELSERVICE (Usando métodos globais e CFI específico) ---

    // 1. Mocka o CFI Específico do navio
    lenient().when(modelService.getCfiCleanTonPerDay(NAVIO_ID)).thenReturn(CFI_LIMPO_BRUNO_LIMA);

    // 2. Mocka a Data Base de Limpeza
    lenient().when(modelService.getLastCleaningDate(NAVIO_ID)).thenReturn(DATA_ULTIMA_LIMPEZA);

    // 3. Mocka os Coeficientes GLOBAIS do OLS
    // lenient().when(modelService.getModelIntercept()).thenReturn(INTERCEPTO_GLOBAL_B0);
    // lenient().when(modelService.getDegradationRate()).thenReturn(TAXA_DEGRADACAO_B1);

    // O HPI Inicial será assumido como o INTERCEPTO_GLOBAL_B0 para fins de teste,
    // pois estamos ignorando TRIM e Deslocamento (assumindo que são zero).

    // A data de limpeza sempre deve ser mockada para o navio de teste.
    lenient().when(modelService.getLastCleaningDate(NAVIO_ID)).thenReturn(DATA_ULTIMA_LIMPEZA);

    // --- MOCKS DO MODELO OLS ---
    // 1. Mocka o retorno do modelo treinado
    lenient().when(modelService.getTrainedModel()).thenReturn(trainedModelMock);

    // 2. Mocka o retorno dos Coeficientes da Regressão (Simulando o resultado do
    // treino)
    lenient().when(trainedModelMock.estimateRegressionParameters()).thenReturn(new double[] {
        INTERCEPTO_GLOBAL_B0, // 0: Intercepto (HPI Base)
        TAXA_DEGRADACAO_B1, // 1: Taxa de Degradação (Dias Desde Limpeza)
        0.001, // 2: TRIM
        0.000002 // 3: Deslocamento
    });
  }

  // ====================================================================
  // TESTE PRINCIPAL: GERAÇÃO DA SUGESTÃO DE LIMPEZA
  // ====================================================================

  @Test
  void suggestCleaningDateDeveRetornarDtoComPrevisoesPara180Dias() {
    when(modelService.getTrainedModel()).thenReturn(trainedModelMock);
    when(trainedModelMock.estimateRegressionParameters()).thenReturn(new double[] {
        INTERCEPTO_SUCESSO, // B0 = 1.01
        TAXA_DEGRADACAO_LENTA, // B1 = 0.00001
        0.001,
        0.000002
    });
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

    // O HPI do Dia 0 será o Intercepto (1.05) APÓS ser ajustado para 1.01 pelo
    // serviço.
    // **ATTENTION:** Use o valor que o 'adjustCoefficients' está realmente
    // forçando.
    double HPI_APOS_AJUSTE = 1.010000;

    // ASSERT: Agora espera o valor ajustado
    assertEquals(HPI_APOS_AJUSTE, diaZero.getHpi(), 0.00001,
        "O HPI do Dia 0 deve ser o Intercepto APÓS a correção de segurança.");

    // Consumo Extra no Dia 0
    double consumoExtraDiaZeroEsperado = CFI_LIMPO_BRUNO_LIMA * (INTERCEPTO_GLOBAL_B0 - 1.0);
    assertEquals(consumoExtraDiaZeroEsperado, diaZero.getExtraFuelTonPerDay(), 0.0001,
        "Consumo Extra no Dia 0 deve ser calculado corretamente.");

    // 2. Validação do HPI no Último Dia (Dia 179)
    int diasAposInicio = MAX_PROJECTION_DAYS - 1; // 179
    DailyPredictionDto ultimoDia = predictions.get(diasAposInicio);

    // HPI Esperado: B0 + (B1 * Dias)
    // double hpiEsperadoUltimoDia = INTERCEPTO_GLOBAL_B0 + (TAXA_DEGRADACAO_B1 * diasAposInicio);
    double hpiEsperadoUltimoDia = INTERCEPTO_SUCESSO + (TAXA_DEGRADACAO_LENTA * diasAposInicio);

    assertEquals(DATA_ULTIMA_LIMPEZA.plusDays(diasAposInicio), ultimoDia.getData(),
        "A data do último dia deve estar correta.");
    assertEquals(hpiEsperadoUltimoDia, ultimoDia.getHpi(), 0.00001,
        "O HPI do último dia deve refletir a degradação total.");

    // Consumo Extra Esperado no Último Dia
    double consumoExtraUltimoDiaEsperado = CFI_LIMPO_BRUNO_LIMA * (hpiEsperadoUltimoDia - 1.0);
    assertEquals(consumoExtraUltimoDiaEsperado, ultimoDia.getExtraFuelTonPerDay(), 0.0001,
        "Consumo Extra no último dia deve ser calculado corretamente.");
  }

  // ====================================================================
  // TESTE DE EXCEÇÃO
  // ====================================================================

  @Test
  void suggestCleaningDateDeveRetornarFallbackDtoQuandoDataLimpezaNula() {
    // ARRANGE: Configura o cenário de FALHA (Dados ausentes/nulos)
    String navioAusente = "Navio Fantasma";

    // 1. Mock do CFI (Pode ser um valor OK, mas a Data de Limpeza é a falha
    // crítica)
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

  @Test
  void suggestCleaningDateDeveSugerirDataExataAoAtingirLimiteCritico() {
    // ARRANGE: Cenário de Teste Específico (Override dos Mocks do Setup)
    String NAVIO_VALIDACAO = "NAVIO MODELO PREDITIVO";
    int DIAS_PARA_LIMPEZA = 150; // O HPI deve atingir o limite no dia 150

    // Mocking do Intercepto e Taxa para o CENÁRIO ESPECÍFICO
    // IMPORTANTE: Os mocks do setup() são mais fracos que os mocks locais.
    // O Mockito deve ser reconfigurado para este cenário:
    when(modelService.getTrainedModel()).thenReturn(trainedModelMock);
    when(trainedModelMock.estimateRegressionParameters()).thenReturn(new double[] {
        INTERCEPTO_PARA_VALIDACAO, // 0: HPI Base (1.000)
        TAXA_DEGRADACAO_VALIDACAO, // 1: Taxa (0.000167)
        0.001,
        0.000002
    });

    // Mocking dos Dados do Navio (Assumindo HPI começa em 1.000 - casco limpo)
    when(modelService.getCfiCleanTonPerDay(NAVIO_VALIDACAO)).thenReturn(CFI_LIMPO_PADRAO);
    when(modelService.getLastCleaningDate(NAVIO_VALIDACAO)).thenReturn(DATA_ULTIMA_LIMPEZA); // Ex: 2025-11-29

    // ---------------------------------------------------------------------------------
    // ACT: Executa a previsão
    CleaningSuggestionDto suggestionDto = predictionService.suggestCleaningDate(NAVIO_VALIDACAO);

    // ---------------------------------------------------------------------------------
    // ASSERT 1: Valida a data ideal de limpeza
    LocalDate dataEsperada = DATA_ULTIMA_LIMPEZA.plusDays(DIAS_PARA_LIMPEZA); // 2025-11-29 + 150 dias

    // O teste é validado se o método encontrar o dia exato
    assertEquals(dataEsperada, suggestionDto.getDataIdealLimpeza(),
        "A data ideal de limpeza deve ser o dia 150, quando o HPI atingiu 1.025.");

    // ASSERT 2: Valida o HPI Exato na Data Sugerida (1.000 + 0.000167 * 150)
    double hpiNoDiaDoCorte = INTERCEPTO_PARA_VALIDACAO + (TAXA_DEGRADACAO_VALIDACAO * DIAS_PARA_LIMPEZA);

    // Busca a previsão da lista para o dia do corte
    DailyPredictionDto predictionNoCorte = suggestionDto.getPredictions().stream()
        .filter(p -> p.getData().equals(dataEsperada))
        .findFirst()
        .orElseThrow(() -> new AssertionError("Dia do corte não encontrado na lista de previsões."));

    assertEquals(hpiNoDiaDoCorte, predictionNoCorte.getHpi(), 0.00001,
        "O HPI no dia da limpeza deve ser exatamente o limite crítico (ou o mais próximo acima).");
  }
}