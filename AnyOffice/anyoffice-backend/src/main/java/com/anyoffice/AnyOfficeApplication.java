package com.anyoffice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * AnyOffice Application
 *
 * B2B Office Procurement Platform - Part of The Stationery Hub
 * Runs on port 8081 (AnySchool is on 8080)
 * Shares stationery_db database with AnySchool
 */
@SpringBootApplication
public class AnyOfficeApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnyOfficeApplication.class, args);
    }
}
