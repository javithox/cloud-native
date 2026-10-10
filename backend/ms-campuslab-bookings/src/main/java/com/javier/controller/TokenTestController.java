package com.javier.controller;

import com.javier.util.TokenGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador para generar tokens JWT de desarrollo/testing.
 * Disponible SOLO cuando security.enabled = false
 */
@Slf4j
@RestController
@RequestMapping("/api/public/token")
@RequiredArgsConstructor
public class TokenTestController {

    private final TokenGeneratorService tokenGeneratorService;

    /**
     * Genera un token JWT para un rol específico
     * 
     * GET /api/public/token?role=ADMIN&expirationMinutes=60
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> generateToken(
            @RequestParam(defaultValue = "ESTUDIANTE") String role,
            @RequestParam(defaultValue = "60") int expirationMinutes) {
        
        String token = tokenGeneratorService.generateToken(role, expirationMinutes);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", role);
        response.put("expirationMinutes", expirationMinutes);
        response.put("usage", "Authorization: Bearer " + token);
        
        log.info("Token generado para rol: {}", role);
        return ResponseEntity.ok(response);
    }

    /**
     * Genera un token con múltiples roles
     * 
     * POST /api/public/token/multi
     * Body: {"roles": ["ADMIN", "TECNICO"]}
     */
    @PostMapping("/multi")
    public ResponseEntity<Map<String, Object>> generateTokenMultiRole(
            @RequestBody Map<String, Object> request) {
        
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) request.getOrDefault("roles", List.of("ESTUDIANTE"));
        int expirationMinutes = (int) request.getOrDefault("expirationMinutes", 60);
        
        String token = tokenGeneratorService.generateTokenWithRoles(roles, expirationMinutes);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("roles", roles);
        response.put("expirationMinutes", expirationMinutes);
        response.put("usage", "Authorization: Bearer " + token);
        
        log.info("Token generado para roles: {}", roles);
        return ResponseEntity.ok(response);
    }

    /**
     * Tokens rápidos precargados para testing
     */
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminToken() {
        return generateToken("ADMIN", 60);
    }

    @GetMapping("/tecnico")
    public ResponseEntity<Map<String, Object>> tecnicoToken() {
        return generateToken("TECNICO", 60);
    }

    @GetMapping("/estudiante")
    public ResponseEntity<Map<String, Object>> estudianteToken() {
        return generateToken("ESTUDIANTE", 60);
    }
}
