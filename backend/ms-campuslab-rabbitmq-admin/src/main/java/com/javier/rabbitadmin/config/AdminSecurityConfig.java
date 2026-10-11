package com.javier.rabbitadmin.config;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class AdminSecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.requestMatchers("/actuator/health", "/error").permitAll()
                .anyRequest().hasAuthority("ROLE_ADMIN"))
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(@Value("${TENANT_ID:00000000-0000-0000-0000-000000000000}") String tenantId,
                          @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer,
                          @Value("${campuslab.security.jwt.audience}") String audience) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(
            "https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys").build();
        OAuth2TokenValidator<Jwt> aud = jwt -> jwt.getAudience().contains(audience)
            ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(
                new org.springframework.security.oauth2.core.OAuth2Error("invalid_token", "Audience inválida", null));
        decoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(issuer), aud));
        return decoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            List<String> names = new ArrayList<>();
            Object roles = jwt.getClaims().get("roles");
            if (roles instanceof Collection<?> collection) collection.stream().filter(String.class::isInstance).map(String.class::cast).forEach(names::add);
            String role = jwt.getClaimAsString("role");
            if (role != null) names.add(role);
            return names.stream().map(n -> n.trim().toUpperCase(Locale.ROOT).replace(' ', '_'))
                .filter(n -> n.equals("ADMIN") || n.equals("ADMINISTRADOR"))
                .map(n -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_ADMIN")).distinct().toList();
        });
        return converter;
    }
}
