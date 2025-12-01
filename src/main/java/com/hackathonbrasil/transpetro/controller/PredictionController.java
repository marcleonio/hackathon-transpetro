package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.model.CleaningSuggestionDto;
import com.hackathonbrasil.transpetro.service.PredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/previsao")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"})
@Tag(name = "Previsão de Limpeza", description = "Endpoints para prever a degradação do casco e sugerir a data ideal de docagem.")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @Operation(summary = "Sugere a data ideal de limpeza/docagem do navio",
                description = "Calcula a projeção de degradação do HPI e sugere o dia em que o HPI atingirá o limite de 1.08.")
    @ApiResponse(responseCode = "200", description = "Previsão de sucesso, contendo a data ideal e a projeção diária.")
    @ApiResponse(responseCode = "500", description = "Erro interno, modelo não treinado ou dados inválidos.")
    @GetMapping("/limpeza-sugerida")
    public ResponseEntity<CleaningSuggestionDto> suggestCleaning(
        @Parameter(description = "ID único ou nome do navio (ex: Victor Oliveira)")
        @RequestParam String navioId

    ) {
        // Chamada ao serviço que executa a regressão e simulação
        CleaningSuggestionDto result = predictionService.suggestCleaningDate(navioId);

        // Sempre retorna 200 OK, mesmo se houver problemas
        // Os problemas são indicados na justificativa do DTO
        return ResponseEntity.ok(result);
    }
}