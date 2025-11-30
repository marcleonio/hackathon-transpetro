package com.hackathonbrasil.transpetro.service;

import com.hackathonbrasil.transpetro.model.Docagem;
import com.hackathonbrasil.transpetro.model.DocagemRequestDto;
import com.hackathonbrasil.transpetro.model.DocagemResponseDto;
import com.hackathonbrasil.transpetro.model.Navio;
import com.hackathonbrasil.transpetro.repository.DocagemRepository;
import com.hackathonbrasil.transpetro.repository.NavioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocagemService {

    @Autowired
    private DocagemRepository docagemRepository;

    @Autowired
    private NavioRepository navioRepository;

    private DocagemResponseDto toResponseDto(Docagem docagem) {
        DocagemResponseDto dto = new DocagemResponseDto();
        dto.setId(docagem.getId());
        dto.setNavioId(docagem.getNavio().getId());
        dto.setNavioNome(docagem.getNavio().getNome());
        dto.setDataDocagem(docagem.getDataDocagem());
        dto.setTipo(docagem.getTipo());
        dto.setObservacoes(docagem.getObservacoes());
        dto.setCreatedAt(docagem.getCreatedAt());
        dto.setUpdatedAt(docagem.getUpdatedAt());
        return dto;
    }

    @Transactional
    public DocagemResponseDto criar(DocagemRequestDto dto) {
        if (dto.getNavioId() == null) {
            throw new IllegalArgumentException("Navio ID é obrigatório");
        }
        Navio navio = navioRepository.findById(dto.getNavioId())
            .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + dto.getNavioId()));

        Docagem docagem = new Docagem();
        docagem.setNavio(navio);
        docagem.setDataDocagem(dto.getDataDocagem());
        docagem.setTipo(dto.getTipo());
        docagem.setObservacoes(dto.getObservacoes());

        docagem = docagemRepository.save(docagem);
        return toResponseDto(docagem);
    }

    @Transactional
    public DocagemResponseDto atualizar(Long id, DocagemRequestDto dto) {
        Docagem docagem = docagemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Docagem não encontrada com ID: " + id));

        if (dto.getNavioId() != null) {
            Navio navio = navioRepository.findById(dto.getNavioId())
                .orElseThrow(() -> new IllegalArgumentException("Navio não encontrado com ID: " + dto.getNavioId()));
            docagem.setNavio(navio);
        }
        if (dto.getDataDocagem() != null) docagem.setDataDocagem(dto.getDataDocagem());
        if (dto.getTipo() != null) docagem.setTipo(dto.getTipo());
        if (dto.getObservacoes() != null) docagem.setObservacoes(dto.getObservacoes());

        docagem = docagemRepository.save(docagem);
        return toResponseDto(docagem);
    }

    public DocagemResponseDto buscarPorId(Long id) {
        Docagem docagem = docagemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Docagem não encontrada com ID: " + id));
        return toResponseDto(docagem);
    }

    public List<DocagemResponseDto> listarTodos() {
        return docagemRepository.findAll().stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public List<DocagemResponseDto> listarPorNavio(Long navioId) {
        return docagemRepository.findByNavioIdOrderByDataDocagemDesc(navioId).stream()
            .map(this::toResponseDto)
            .collect(Collectors.toList());
    }

    public DocagemResponseDto buscarUltimaDocagemPorNavio(Long navioId) {
        return docagemRepository.findUltimaDocagemByNavioId(navioId)
            .map(this::toResponseDto)
            .orElseThrow(() -> new IllegalArgumentException("Nenhuma docagem encontrada para o navio com ID: " + navioId));
    }

    @Transactional
    public void deletar(Long id) {
        if (!docagemRepository.existsById(id)) {
            throw new IllegalArgumentException("Docagem não encontrada com ID: " + id);
        }
        docagemRepository.deleteById(id);
    }
}

