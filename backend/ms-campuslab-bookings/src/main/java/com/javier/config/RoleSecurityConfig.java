package com.javier.config;

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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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
@EnableWebSecurity
@EnableMethodSecurity
public class RoleSecurityConfig {
    @Value("${APP_SECURITY_ENABLED:true}")
    private boolean appSecurityEnabled;
    @Value("${app.security.enabled:true}")
    private boolean appSecurityEnabledAlt;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.disable());
        if (!appSecurityEnabled && !appSecurityEnabledAlt) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/catalog/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "ROLE_ESTUDIANTE")
                .requestMatchers("/api/catalog/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers(HttpMethod.PUT, "/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers(HttpMethod.DELETE, "/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO")
                .requestMatchers("/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "ROLE_ESTUDIANTE")
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${TENANT_ID:00000000-0000-0000-0000-000000000000}") String tenantId,
                          @Value("${campuslab.security.jwt.audience}") String audience,
                          @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(
            "https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys").build();
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
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> names = new ArrayList<>();
            Object roles = jwt.getClaims().get("roles");
            if (roles instanceof Collection<?> values) values.stream().filter(String.class::isInstance).map(String.class::cast).forEach(names::add);
            for (String claim : List.of("role", "appRole")) {
                String value = jwt.getClaimAsString(claim);
                if (value != null && !value.isBlank()) names.add(value);
            }
            return names.stream().map(this::canonicalRole).filter(value -> !value.isBlank()).distinct()
                .map(value -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + value)).toList();
        });
        return converter;
    }

    private String canonicalRole(String role) {
        String roleName = role.trim().replaceFirst("(?i)^ROLE_", "");
        String normalized = Normalizer.normalize(roleName, Normalizer.Form.NFD).replaceAll("\\p{M}+", "")
            .toUpperCase(Locale.ROOT).replace('_', ' ');
        return switch (normalized) {
            case "ADMIN", "ADMINISTRADOR" -> "ADMIN";
            case "TECNICO", "OPERADOR", "OPERADOR DEL DOMINIO", "OPERADOR DE DOMINIO" -> "TECNICO";
            case "ESTUDIANTE", "CLIENTE", "CLIENTE DEL DOMINIO", "CLIENTE DE DOMINIO" -> "ESTUDIANTE";
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
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
