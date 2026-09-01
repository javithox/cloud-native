@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig{

    @Bean
    public SecurityFilterChain securityFilterChain(
HttpSecurity http) throws Exception
        http                    {
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequest(auth -> auth
                .anyRequest().autherticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());
        return http.build()
        }
    }