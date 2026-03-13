package com.eventos.inscrip_service.service;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.entity.Inscription;
import com.eventos.inscrip_service.exception.InscriptionException;
import com.eventos.inscrip_service.mapper.InscriptionMapper;
import com.eventos.inscrip_service.repository.InscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InscriptionServiceTest {

    @Mock
    private InscriptionRepository inscriptionRepository;

    @Mock
    private InscriptionMapper inscriptionMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private InscriptionService inscriptionService;

    private Inscription inscription;
    private InscriptionRequest request;
    private InscriptionResponse response;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(inscriptionService, "eventServiceUrl", "http://localhost:8083");
        ReflectionTestUtils.setField(inscriptionService, "restTemplate", restTemplate);

        request = new InscriptionRequest();
        request.setUserId(1L);
        request.setEventId(100L);

        inscription = new Inscription();
        inscription.setId(1L);

        response = new InscriptionResponse();
        response.setId(1L);
    }

    @Test
    void createInscription_WhenDuplicate_ThrowsException() {
        when(inscriptionRepository.existsByUserIdAndEventId(1L, 100L)).thenReturn(true);

        assertThrows(InscriptionException.class, () -> inscriptionService.createInscription(request));
    }

    @Test
    void createInscription_WhenEventExists_Success() {
        when(inscriptionRepository.existsByUserIdAndEventId(1L, 100L)).thenReturn(false);
        when(restTemplate.postForEntity("http://localhost:8083/events/100/reserve", null, Object.class))
                .thenReturn(ResponseEntity.ok().build());
        when(inscriptionMapper.toEntity(any(InscriptionRequest.class))).thenReturn(inscription);
        when(inscriptionRepository.save(any(Inscription.class))).thenReturn(inscription);
        when(inscriptionMapper.toResponse(any(Inscription.class))).thenReturn(response);

        InscriptionResponse r = inscriptionService.createInscription(request);

        assertNotNull(r);
        assertEquals(1L, r.getId());
    }
}
