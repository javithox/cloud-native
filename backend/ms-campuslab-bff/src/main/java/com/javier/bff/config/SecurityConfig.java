package com.javier.bff.config;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/error").permitAll()
                .requestMatchers("/api/admin/rabbitmq/**", "/api/admin/kafka/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/catalog/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "ROLE_ESTUDIANTE")
                .requestMatchers("/api/catalog/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers("/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "ROLE_ESTUDIANTE")
                .requestMatchers("/api/audit/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AUDITOR")
                .requestMatchers("/api/report/**").hasAuthority("ROLE_ADMIN")
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(
            @Value("${TENANT_ID:00000000-0000-0000-0000-000000000000}") String tenantId,
            @Value("${campuslab.security.jwt.audience}") String audience,
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer) {
        String jwks = "https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys";
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwks).build();
        OAuth2TokenValidator<Jwt> audienceValidator = jwt -> jwt.getAudience().contains(audience)
            ? OAuth2TokenValidatorResult.success()
            : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Audience no válida para CampusLab", null));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(issuer), audienceValidator));
        return decoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::authoritiesFromClaims);
        return converter;
    }

    private Collection<GrantedAuthority> authoritiesFromClaims(Jwt jwt) {
        List<String> roleNames = new ArrayList<>();
        Object roles = jwt.getClaims().get("roles");
        if (roles instanceof Collection<?> collection) {
            collection.stream().filter(String.class::isInstance).map(String.class::cast).forEach(roleNames::add);
        }
        for (String claim : List.of("role", "appRole")) {
            String role = jwt.getClaimAsString(claim);
            if (role != null && !role.isBlank()) roleNames.add(role);
        }
        return roleNames.stream().map(this::canonicalRole).filter(role -> !role.isBlank()).distinct()
            .map(role -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + role)).toList();
    }

    private String canonicalRole(String role) {
        String normalized = Normalizer.normalize(role.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "").toUpperCase(Locale.ROOT).replace('_', ' ');
        return switch (normalized) {
            case "ADMIN", "ADMINISTRADOR" -> "ADMIN";
            case "TECNICO", "OPERADOR", "OPERADOR DEL DOMINIO", "OPERADOR DE DOMINIO" -> "TECNICO";
            case "ESTUDIANTE", "CLIENTE", "CLIENTE DEL DOMINIO", "CLIENTE DE DOMINIO" -> "ESTUDIANTE";
            case "AUDITOR" -> "AUDITOR";
            default -> "";
        };
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${FRONTEND_ALLOWED_ORIGINS:http://localhost:4200,http://127.0.0.1:4200}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(java.util.Arrays.stream(allowedOrigins.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Correlation-ID", "X-Request-ID"));
        config.setExposedHeaders(List.of("X-Correlation-ID"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
