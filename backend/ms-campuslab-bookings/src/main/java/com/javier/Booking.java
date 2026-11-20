package com.javier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio de reservas.
 */
@SpringBootApplication
public class Booking {

    public static void main(String[] args) {
        SpringApplication.run(Booking.class, args);
    }
}