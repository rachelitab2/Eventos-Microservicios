package com.eventos.inscrip_service.controller;

import com.eventos.inscrip_service.dto.InscriptionRequest;
import com.eventos.inscrip_service.dto.InscriptionResponse;
import com.eventos.inscrip_service.service.InscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public class InscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InscriptionService inscriptionService;

    @MockBean
    private com.eventos.inscrip_service.config.JwtInterceptor jwtInterceptor;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() throws Exception {
        Mockito.when(jwtInterceptor.preHandle(any(), any(), any())).thenReturn(true);
    }

    @Test
    void create_ValidRequest_ReturnsCreated() throws Exception {
        InscriptionRequest req = new InscriptionRequest(1L, 1L);

        Mockito.when(inscriptionService.createInscription(any(InscriptionRequest.class)))
                .thenReturn(new InscriptionResponse());

        mockMvc.perform(post("/inscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void create_InvalidRequest_ReturnsBadRequest() throws Exception {
        InscriptionRequest req = new InscriptionRequest(null, 1L);

        mockMvc.perform(post("/inscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
