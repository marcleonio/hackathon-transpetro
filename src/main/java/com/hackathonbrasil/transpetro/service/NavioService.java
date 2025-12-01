package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.model.NavioRequestDto;
import com.hackathonbrasil.transpetro.model.NavioResponseDto;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NavioService {

    @Autowired
    private NavioRepository navioRepository;

    private NavioResponseDto toResponseDto(Navio navio) {
        NavioResponseDto dto = new NavioResponseDto();
        dto.setId(navio.getId());
        dto.setNome(navio.getNome());
        dto.setClasse(navio.getClasse());
        dto.setTipo(navio.getTipo());
        dto.setPorteBruto(navio.getPorteBruto());
        dto.setComprimentoTotal(navio.getComprimentoTotal());
        dto.setBoca(navio.getBoca());
        dto.setCalado(navio.getCalado());
        dto.setPontal(navio.getPontal());
        dto.setCreatedAt(navio.getCreatedAt());
        dto.setUpdatedAt(navio.getUpdatedAt());
        return dto;
    }

    private Navio toEntity(NavioRequestDto dto) {
        Navio navio = new Navio();
        navio.setNome(dto.getNome());
        navio.setClasse(dto.getClasse());
        navio.setTipo(dto.getTipo());
        navio.setPorteBruto(dto.getPorteBruto());
        navio.setComprimentoTotal(dto.getComprimentoTotal());
        navio.setBoca(dto.getBoca());
        navio.setCalado(dto.getCalado());
        navio.setPontal(dto.getPontal());
        return navio;
    }

    @Transactional
    public NavioResponseDto criar(NavioRequestDto dto) {
        if (dto.getNome() == null || dto.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do navio é obrigatório");
        }
        if (navioRepository.existsByNome(dto.getNome().trim())) {
            throw new IllegalArgumentException("Navio com nome '" + dto.getNome() + "' já existe");
        }
        Navio navio = toEntity(dto);
        navio = navioRepository.save(navio);
        return toResponseDto(navio);
    }

    @Transactional
    public NavioResponseDto atualizar(Long id, NavioRequestDto dto) {
        Navio navio = navioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + id));
        
        if (dto.getNome() != null && !dto.getNome().trim().isEmpty()) {
            // Verificar se outro navio já tem esse nome
            navioRepository.findByNome(dto.getNome().trim())
                .ifPresent(n -> {
                    if (!n.getId().equals(id)) {
                        throw new IllegalArgumentException("Navio com nome '" + dto.getNome() + "' já existe");
                    }
                });
            navio.setNome(dto.getNome().trim());
        }
        if (dto.getClasse() != null) navio.setClasse(dto.getClasse());
        if (dto.getTipo() != null) navio.setTipo(dto.getTipo());
        if (dto.getPorteBruto() != null) navio.setPorteBruto(dto.getPorteBruto());
        if (dto.getComprimentoTotal() != null) navio.setComprimentoTotal(dto.getComprimentoTotal());
        if (dto.getBoca() != null) navio.setBoca(dto.getBoca());
        if (dto.getCalado() != null) navio.setCalado(dto.getCalado());
        if (dto.getPontal() != null) navio.setPontal(dto.getPontal());
        
        navio = navioRepository.save(navio);
        return toResponseDto(navio);
    }

    public NavioResponseDto buscarPorId(Long id) {
        Navio navio = navioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + id));
        return toResponseDto(navio);
    }

    public NavioResponseDto buscarPorNome(String nome) {
        Navio navio = navioRepository.findByNome(nome)
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com nome: " + nome));
        return toResponseDto(navio);
    }

    public List<NavioResponseDto> listarTodos() {
        List<NavioResponseDto> naviosFromDB = navioRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());

        Set<String> nomesNormalizados = naviosFromDB.stream()
            .map(n -> normalizeShipName(n.getNome()))
            .collect(Collectors.toSet());

        try {
            Reader in = new InputStreamReader(new ClassPathResource("dados_navio.csv").getInputStream());
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Nome do navio", "Classe", "Tipo", "Porte Bruto", "Comprimento total (m)", "Boca (m)", "Calado (m)", "Pontal (m)")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String nomeNavio = record.get("Nome do navio").trim();
                if (!nomeNavio.isEmpty()) {
                    String normalized = normalizeShipName(nomeNavio);
                    if (!nomesNormalizados.contains(normalized)) {
                        nomesNormalizados.add(normalized);
                        NavioResponseDto dto = new NavioResponseDto();
                        dto.setNome(nomeNavio);
                        dto.setClasse(record.get("Classe").trim());
                        dto.setTipo(record.get("Tipo").trim());
                        try {
                            dto.setPorteBruto(Double.parseDouble(record.get("Porte Bruto").trim()));
                        } catch (NumberFormatException ignored) {}
                        try {
                            dto.setComprimentoTotal(Double.parseDouble(record.get("Comprimento total (m)").trim()));
                        } catch (NumberFormatException ignored) {}
                        try {
                            dto.setBoca(Double.parseDouble(record.get("Boca (m)").trim()));
                        } catch (NumberFormatException ignored) {}
                        try {
                            dto.setCalado(Double.parseDouble(record.get("Calado (m)").trim()));
                        } catch (NumberFormatException ignored) {}
                        try {
                            dto.setPontal(Double.parseDouble(record.get("Pontal (m)").trim()));
                        } catch (NumberFormatException ignored) {}
                        naviosFromDB.add(dto);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Erro ao ler CSV de navios: " + e.getMessage());
        }

        return naviosFromDB;
    }

    private String normalizeShipName(String name) {
        if (name == null) return "";
        return Normalizer.normalize(name.trim(), Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
            .toLowerCase()
            .replaceAll("\\s+", " ");
    }

    public List<String> listarTodosNomesUnicos() {
        Set<String> nomesUnicosNormalizados = new LinkedHashSet<>();
        Map<String, String> normalizedToOriginal = new HashMap<>();

        navioRepository.findAll().forEach(navio -> {
            String nome = navio.getNome().trim();
            String normalized = normalizeShipName(nome);
            if (!normalizedToOriginal.containsKey(normalized)) {
                normalizedToOriginal.put(normalized, nome);
            }
            nomesUnicosNormalizados.add(normalized);
        });

        try {
            Reader in = new InputStreamReader(new ClassPathResource("dados_navio.csv").getInputStream());
            Iterable<CSVRecord> records = CSVFormat.DEFAULT
                .builder()
                .setHeader("Nome do navio", "Classe", "Tipo", "Porte Bruto", "Comprimento total (m)", "Boca (m)", "Calado (m)", "Pontal (m)")
                .setSkipHeaderRecord(true)
                .build()
                .parse(in);

            for (CSVRecord record : records) {
                String nomeNavio = record.get("Nome do navio").trim();
                if (!nomeNavio.isEmpty()) {
                    String normalized = normalizeShipName(nomeNavio);
                    if (!nomesUnicosNormalizados.contains(normalized)) {
                        nomesUnicosNormalizados.add(normalized);
                        normalizedToOriginal.put(normalized, nomeNavio);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Erro ao ler CSV de navios: " + e.getMessage());
        }

        return nomesUnicosNormalizados.stream()
            .map(normalized -> normalizedToOriginal.get(normalized))
            .filter(Objects::nonNull)
            .sorted()
            .collect(Collectors.toList());
    }

    @Transactional
    public void deletar(Long id) {
        if (!navioRepository.existsById(id)) {
            throw new IllegalArgumentException("Navio não encontrado com ID: " + id);
        }
        navioRepository.deleteById(id);
    }
}

