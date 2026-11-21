package com.vcube.stockpilot.config;

import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;

@Configuration
public class SecurityConfig {
    @Bean BCryptPasswordEncoder passwords() { return new BCryptPasswordEncoder(); }

    @Bean SecretKey signingKey(@Value("${jwt.secret:${JWT_SECRET:stockpilot-secret-key-must-be-at-least-32-bytes-long-1234567890}}") String secret) {
        byte[] bytes=secret.getBytes(StandardCharsets.UTF_8);
        if(bytes.length<32) throw new IllegalArgumentException("JWT_SECRET must contain at least 32 bytes");
        return new SecretKeySpec(bytes,"HmacSHA256");
    }

    @Bean JwtDecoder decoder(SecretKey key) {
        var decoder=NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer("stockpilot"));
        return decoder;
    }

    private final AuthenticationEntryPoint unauthorized = (request, response, failure) -> {
        new BearerTokenAuthenticationEntryPoint().commence(request, response, failure);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"Log in to StockPilot and send a valid Bearer token\"}");
    };

    @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http.csrf(c->c.disable()).cors(c->{})
            .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a->a.requestMatchers("/api/auth/**","/api/public/**","/error").permitAll().anyRequest().authenticated())
            .exceptionHandling(e->e.authenticationEntryPoint(unauthorized))
            .oauth2ResourceServer(o->o.authenticationEntryPoint(unauthorized).jwt(j->{})).build();
    }

    @Bean CorsConfigurationSource corsConfigurationSource(@Value("${frontend.origin:${FRONTEND_ORIGIN:http://localhost:5173}}") String origin) {
        var config=new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        config.setAllowCredentials(true);
        var source=new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**",config);
        return source;
    }
}
