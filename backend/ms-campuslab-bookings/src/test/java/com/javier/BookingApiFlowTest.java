package com.javier;

import com.javier.repository.BookingRepository;
import com.javier.service.CatalogClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = Booking.class)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:bookingstest;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BookingApiFlowTest {

    @Configuration
    static class TestSecurityConfig {
        @Bean
        JwtDecoder jwtDecoder() {
            return new JwtDecoder() {
                @Override
                public Jwt decode(String token) throws JwtException {
                    return Jwt.withTokenValue(token)
                            .header("alg", "none")
                            .claim("sub", "student")
                            .claim("roles", java.util.List.of("ESTUDIANTE"))
                            .build();
                }
            };
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @MockBean
    private CatalogClient catalogClient;

    @MockBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockBean
    private RabbitTemplate rabbitTemplate;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
    }

    @Test
    void shouldAcceptBookingCreationWhenPayloadIsValid() throws Exception {
        long resourceId = 999L;

        when(catalogClient.getResource(resourceId)).thenReturn(new CatalogClient.ResourceInfo(
                resourceId,
                "LAB-999",
                "Laboratorio 999",
                "Aula de pruebas aislada",
                "LABORATORIO",
                10,
                10,
                true
        ));

        String payload = """
            {
              "studentId": "S-1001",
              "studentEmail": "student@test.com",
              "resourceId": 999,
              "startTime": "2099-12-10T09:00:00",
              "endTime": "2099-12-10T11:00:00",
              "notes": "Prueba de integración"
            }
            """;

        mockMvc.perform(post("/api/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer student-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated());
    }
}
