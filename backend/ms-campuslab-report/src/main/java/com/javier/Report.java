package com.javier;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio de reportes.
 */
@SpringBootApplication
public class Report {

    public static void main(String[] args) {
        SpringApplication.run(Report.class, args);
    }
}