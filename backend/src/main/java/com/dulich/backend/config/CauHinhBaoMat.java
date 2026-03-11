package com.dulich.backend.config;

import com.dulich.backend.security.JwtLocXacThuc;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class CauHinhBaoMat {

    private final JwtLocXacThuc jwtLocXacThuc;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/thoi-tiet/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cong-khai/bai-viet/**").permitAll()
                        .requestMatchers("/api/nhan-vien/bai-viet/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/danh-muc/**", "/api/dia-diem/**").permitAll()
                        .requestMatchers("/api/danh-muc/**", "/api/dia-diem/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/tour/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tour/pho-bien").permitAll()
                        .requestMatchers("/api/tour/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/lich-khoi-hanh/**").permitAll()
                        .requestMatchers("/api/lich-khoi-hanh/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/hinh-anh/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/lich-trinh/**").permitAll()
                        .requestMatchers("/api/lich-trinh/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/hinh-anh/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/cong-khai/he-thong/cai-dat").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/cong-khai/he-thong/lien-he").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/quan-tri/he-thong/cai-dat").permitAll()
                        .requestMatchers("/api/quan-tri/nguoi-dung/khach-hang", "/api/quan-tri/chat/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/quan-tri/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/thanh-toan/**").permitAll()
                        .requestMatchers("/api/dat-tour/xac-nhan-thanh-toan/**")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/dat-tour/duyet/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/dat-tour/xuat-excel/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/dat-tour/quan-ly").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/danh-gia/**").permitAll()
                        .requestMatchers("/api/danh-gia/phan-hoi").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/voucher/**").permitAll()
                        .requestMatchers("/api/voucher/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/thong-ke/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/yeu-thich/**").authenticated()
                        .requestMatchers("/api/chatbot/dong-bo", "/api/chatbot/upload-tai-lieu",
                                "/api/chatbot/tai-lieu/**")
                        .hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/chatbot/**").permitAll()
                        .requestMatchers("/api/quan-tri/chat/thong-ke-rag", "/api/quan-tri/chat/tai-lieu")
                        .hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/flash-sales/**").permitAll()
                        .requestMatchers("/api/flash-sales/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_STAFF")
                        .requestMatchers("/api/thong-bao/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtLocXacThuc, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
