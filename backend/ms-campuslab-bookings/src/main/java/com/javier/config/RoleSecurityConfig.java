package com.javier.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.text.Normalizer;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class RoleSecurityConfig {

    @Value("${APP_SECURITY_ENABLED:false}")
    private boolean appSecurityEnabled;

    @Value("${app.security.enabled:false}")
    private boolean appSecurityEnabledAlt;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable());

        // Detectar si seguridad está deshabilitada (desarrollo local)
        boolean securityDisabled = !appSecurityEnabled && !appSecurityEnabledAlt;
        
        if (securityDisabled) {
            http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/actuator/health", "/error").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                .requestMatchers("/api/catalog/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "SCOPE_archivos")
                .requestMatchers("/api/bookings/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_TECNICO", "ROLE_ESTUDIANTE", "SCOPE_archivos")
                .requestMatchers("/api/report/**").hasAnyAuthority("ROLE_ADMIN", "SCOPE_archivos")
                .requestMatchers("/api/audit/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_AUDITOR", "SCOPE_archivos")

                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            );

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder(
            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}") String jwkSetUri,
            @Value("${TENANT_ID:bda559f7-26d8-4062-88a2-da66f2286b5f}") String tenantId,
            @Value("${campuslab.security.jwt.audience}") String audience) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();
        OAuth2TokenValidator<Jwt> tenantAndAudienceValidator = jwt -> {
            String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
            String expectedIssuer = "https://sts.windows.net/" + tenantId + "/";
            boolean validTenant = tenantId.equals(jwt.getClaimAsString("tid"));
            boolean validAudience = jwt.getAudience().contains(audience);
            if (expectedIssuer.equals(issuer) && validTenant && validAudience) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                    "invalid_token", "El token no corresponde al tenant y API configurados", null));
        };
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(), tenantAndAudienceValidator));
        return decoder;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${FRONTEND_ALLOWED_ORIGINS:http://localhost:4200,http://127.0.0.1:4200,https://campuslab.ddns.net}") String allowedOrigins) {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isBlank())
            .toList());

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Set<GrantedAuthority> authorities = new HashSet<>();

            // role: "Admin"
            String roleClaim = jwt.getClaimAsString("role");
            if (roleClaim != null && !roleClaim.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizeRole(roleClaim)));
            }

            // roles: ["Admin", "Tecnico"]
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null) {
                for (String role : roles) {
                    if (role != null && !role.isBlank()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizeRole(role)));
                    }
                }
            }

            // groups: ["Admin"] (por si lo usas en Azure)
            List<String> groups = jwt.getClaimAsStringList("groups");
            if (groups != null) {
                for (String group : groups) {
                    if (group != null && !group.isBlank()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizeRole(group)));
                    }
                }
            }

            // App role emitido por Azure AD
            String appRole = jwt.getClaimAsString("appRole");
            if (appRole != null && !appRole.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizeRole(appRole)));
            }

            // Azure AD scope claim: "scp": "archivos"
            String scope = jwt.getClaimAsString("scp");
            if (scope != null && !scope.isBlank()) {
                for (String scopeValue : scope.split(" ")) {
                    if (!scopeValue.isBlank()) {
                        authorities.add(new SimpleGrantedAuthority("SCOPE_" + scopeValue.trim()));
                    }
                }
            }

            return authorities;
        });

        return converter;
    }

    private String normalizeRole(String role) {
        String normalized = Normalizer.normalize(role.trim(), Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .toUpperCase();
        return normalized.startsWith("ROLE_") ? normalized.substring(5) : normalized;
    }
}
