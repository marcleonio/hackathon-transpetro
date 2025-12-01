package com.hackathonbrasil.transpetro.controller;

import com.hackathonbrasil.transpetro.service.DataImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
               description = "Importa navios do arquivo CSV enviado ou do arquivo padrão dados_navio.csv")
    @PostMapping(value = "/navios", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<Map<String, Object>> importNavios(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dataImportService.importNaviosCSV(file);
                result.put("message", "Navios importados do arquivo: " + count);
            } else {
                count = dataImportService.importNaviosCSV("dados_navio.csv");
                result.put("message", "Navios importados: " + count);
            }
            result.put("success", true);
            result.put("imported", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar docagens do CSV",
               description = "Importa docagens do arquivo CSV enviado ou do arquivo padrão dados_docagem.csv")
    @PostMapping(value = "/docagens", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<Map<String, Object>> importDocagens(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dataImportService.importDocagemCSV(file);
                result.put("message", "Docagens importadas do arquivo: " + count);
            } else {
                count = dataImportService.importDocagemCSV("dados_docagem.csv");
                result.put("message", "Docagens importadas: " + count);
            }
            result.put("success", true);
            result.put("imported", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar eventos do CSV",
               description = "Importa eventos de navegação do arquivo CSV enviado ou do arquivo padrão ResultadoQueryEventos.csv")
    @PostMapping(value = "/eventos", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<Map<String, Object>> importEventos(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dataImportService.importEventosCSV(file);
                result.put("message", "Eventos importados do arquivo: " + count);
            } else {
                count = dataImportService.importEventosCSV("ResultadoQueryEventos.csv");
                result.put("message", "Eventos importados: " + count);
            }
            result.put("success", true);
            result.put("imported", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar consumos do CSV",
               description = "Importa consumos do arquivo CSV enviado ou do arquivo padrão ResultadoQueryConsumo.csv")
    @PostMapping(value = "/consumos", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<Map<String, Object>> importConsumos(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dataImportService.importConsumosCSV(file);
                result.put("message", "Consumos importados do arquivo: " + count);
            } else {
                count = dataImportService.importConsumosCSV("ResultadoQueryConsumo.csv");
                result.put("message", "Consumos importados: " + count);
            }
            result.put("success", true);
            result.put("imported", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }

    @Operation(summary = "Importar revestimentos do CSV",
               description = "Importa revestimentos do arquivo CSV enviado ou do arquivo padrão revestimento.csv")
    @PostMapping(value = "/revestimentos", consumes = {"multipart/form-data", "application/json"})
    public ResponseEntity<Map<String, Object>> importRevestimentos(
            @RequestParam(value = "file", required = false) MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            int count;
            if (file != null && !file.isEmpty()) {
                count = dataImportService.importRevestimentosCSV(file);
                result.put("message", "Revestimentos importados do arquivo: " + count);
            } else {
                count = dataImportService.importRevestimentosCSV("revestimento.csv");
                result.put("message", "Revestimentos importados: " + count);
            }
            result.put("success", true);
            result.put("imported", count);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "Erro na importação: " + e.getMessage());
            return ResponseEntity.internalServerError().body(result);
        }
    }
}


