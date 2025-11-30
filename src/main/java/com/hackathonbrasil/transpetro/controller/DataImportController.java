package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.service.DataImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/import")
@Tag(name = "Importação de Dados", description = "Endpoints para importar dados de CSVs para o banco de dados")
public class DataImportController {

    @Autowired
    private DataImportService dataImportService;

    @Operation(summary = "Importar todos os CSVs padrão",
               description = "Importa todos os arquivos CSV padrão do projeto (navios, docagens, eventos, consumos, revestimentos)")
    @PostMapping("/all")
    public ResponseEntity<Map<String, Object>> importAllCSVs() {
        Map<String, Object> result = new HashMap<>();
        try {
            dataImportService.importAllDefaultCSVs();
            result.put("success", true);
            result.put("message", "Importação concluída com sucesso");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar navios do CSV",
               description = "Importa navios do arquivo dados_navio.csv")
    @PostMapping("/navios")
    public ResponseEntity<Map<String, Object>> importNavios() {
        Map<String, Object> result = new HashMap<>();
        try {
            int count = dataImportService.importNaviosCSV("dados_navio.csv");
            result.put("success", true);
            result.put("imported", count);
            result.put("message", "Navios importados: " + count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar docagens do CSV",
               description = "Importa docagens do arquivo dados_docagem.csv")
    @PostMapping("/docagens")
    public ResponseEntity<Map<String, Object>> importDocagens() {
        Map<String, Object> result = new HashMap<>();
        try {
            int count = dataImportService.importDocagemCSV("dados_docagem.csv");
            result.put("success", true);
            result.put("imported", count);
            result.put("message", "Docagens importadas: " + count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar eventos do CSV",
               description = "Importa eventos de navegação do arquivo ResultadoQueryEventos.csv")
    @PostMapping("/eventos")
    public ResponseEntity<Map<String, Object>> importEventos() {
        Map<String, Object> result = new HashMap<>();
        try {
            int count = dataImportService.importEventosCSV("ResultadoQueryEventos.csv");
            result.put("success", true);
            result.put("imported", count);
            result.put("message", "Eventos importados: " + count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar consumos do CSV",
               description = "Importa consumos do arquivo ResultadoQueryConsumo.csv")
    @PostMapping("/consumos")
    public ResponseEntity<Map<String, Object>> importConsumos() {
        Map<String, Object> result = new HashMap<>();
        try {
            int count = dataImportService.importConsumosCSV("ResultadoQueryConsumo.csv");
            result.put("success", true);
            result.put("imported", count);
            result.put("message", "Consumos importados: " + count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar revestimentos do CSV",
               description = "Importa revestimentos do arquivo revestimento.csv")
    @PostMapping("/revestimentos")
    public ResponseEntity<Map<String, Object>> importRevestimentos() {
        Map<String, Object> result = new HashMap<>();
        try {
            int count = dataImportService.importRevestimentosCSV("revestimento.csv");
            result.put("success", true);
            result.put("imported", count);
            result.put("message", "Revestimentos importados: " + count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}


