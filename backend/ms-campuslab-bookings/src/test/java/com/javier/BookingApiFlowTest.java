package com.javier;

import com.javier.repository.BookingRepository;
import com.javier.service.CatalogClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BookingRepository bookingRepository;

    @MockitoBean
    private CatalogClient catalogClient;

    @MockitoBean
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockitoBean
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
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ESTUDIANTE")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
                .andExpect(status().isCreated());
    }
}
