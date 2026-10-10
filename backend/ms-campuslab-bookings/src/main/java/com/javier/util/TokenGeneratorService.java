package com.javier.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Servicio para generar tokens JWT de prueba.
 * Usado exclusivamente para desarrollo local.
 */
@Slf4j
@Service
public class TokenGeneratorService {

    private static final String SECRET_KEY = "mi-clave-super-secreta-de-desarrollo-local-bookings-2024";
    private static final String ISSUER = "campuslab-bookings";

    @Value("${campuslab.security.jwt.audience:api://e03479f6-d22d-4624-aa81-6e724d570329}")
    private String audience;

    /**
     * Genera un token JWT válido para testing
     * 
     * @param role Rol del usuario (ADMIN, TECNICO, ESTUDIANTE)
     * @param expirationMinutes Minutos de expiración
     * @return Token JWT
     */
    public String generateToken(String role, int expirationMinutes) {
        long now = System.currentTimeMillis();
        long expirationTime = now + (expirationMinutes * 60 * 1000);

        SecretKeySpec secretKey = new SecretKeySpec(
            SECRET_KEY.getBytes(StandardCharsets.UTF_8),
            SignatureAlgorithm.HS256.getJcaName()
        );

        return Jwts.builder()
            .subject("test-user")
            .issuer(ISSUER)
            .audience().add(audience).and()
            .claim("role", role)
            .claim("roles", List.of(role))
            .claim("scp", "archivos")
            .issuedAt(new Date(now))
            .expiration(new Date(expirationTime))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Genera un token con múltiples roles
     */
    public String generateTokenWithRoles(List<String> roles, int expirationMinutes) {
        long now = System.currentTimeMillis();
        long expirationTime = now + (expirationMinutes * 60 * 1000);

        SecretKeySpec secretKey = new SecretKeySpec(
            SECRET_KEY.getBytes(StandardCharsets.UTF_8),
            SignatureAlgorithm.HS256.getJcaName()
        );

        return Jwts.builder()
            .subject("test-user")
            .issuer(ISSUER)
            .audience().add(audience).and()
            .claim("roles", roles)
            .claim("scp", "archivos")
            .issuedAt(new Date(now))
            .expiration(new Date(expirationTime))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }
}
