package com.anyoffice.config;

import com.anyoffice.model.OfficeUser;
import com.anyoffice.model.OfficeUserRole;
import com.anyoffice.repository.OfficeUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final OfficeUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            OfficeUser admin = new OfficeUser();
            admin.setEmail("admin@anyoffice.co.za");
            admin.setPassword(passwordEncoder.encode("Admin@2024"));
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(OfficeUserRole.SUPER_ADMIN);
            admin.setEmailVerified(true);
            admin.setEnabled(true);

            userRepository.save(admin);
            log.warn("=======================================================");
            log.warn("SUPER_ADMIN created: admin@anyoffice.co.za / Admin@2024");
            log.warn("CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!");
            log.warn("=======================================================");
        }
    }
}
