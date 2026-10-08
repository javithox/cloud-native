package com.javier.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RoleSecurityConfigTest {
    private final RoleSecurityConfig config = new RoleSecurityConfig();

    @Test
    void convertsAccentedTechnicianRoleToExpectedAuthority() {
        Jwt jwt = Jwt.withTokenValue("unit-test")
                .header("alg", "none")
                .claim("roles", List.of("Técnico"))
                .build();

        Authentication authentication = config.jwtAuthenticationConverter().convert(jwt);

        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_TECNICO")));
    }

    @Test
    void acceptsCustomAppRoleClaim() {
        Jwt jwt = Jwt.withTokenValue("unit-test")
                .header("alg", "none")
                .claim("appRole", "ROLE_Admin")
                .build();

        Authentication authentication = config.jwtAuthenticationConverter().convert(jwt);

        assertNotNull(authentication);
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
    }
}
