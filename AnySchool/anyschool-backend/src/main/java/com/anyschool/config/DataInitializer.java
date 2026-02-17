package com.anyschool.config;

import com.anyschool.model.*;
import com.anyschool.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * Data Initializer
 * 
 * Loads demo data into the database on application startup.
 * Only runs if database is empty (prevents duplicates).
 * 
 * Phase 2: Demo data for testing
 * Phase 3: Can be disabled in production with @Profile("dev")
 */
@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final SchoolRepository schoolRepository;
    private final StationeryRepository stationeryRepository;

    public DataInitializer(
            SchoolRepository schoolRepository,
            StationeryRepository stationeryRepository
    ) {
        this.schoolRepository = schoolRepository;
        this.stationeryRepository = stationeryRepository;
    }

    @Override
    public void run(String... args) {
        log.info("========================================");
        log.info("Starting Data Initialization...");
        log.info("========================================");

        // Check if data already exists
        if (schoolRepository.count() > 0) {
            log.info("========================================");
            log.info("ℹ️  Database already initialized.");
            log.info("ℹ️  Skipping DataInitializer to avoid duplicates.");
            log.info("========================================");
            log.info("📊 Current database state:");
            log.info("   Schools: {}", schoolRepository.count());
            log.info("   Stationery: {}", stationeryRepository.count());
            log.info("========================================");
            return;
        }

        // Only load schools and stationery (users created via SQL script)
        int schoolsCreated = initializeSchools();
        int stationeryCreated = initializeStationery();

        log.info("========================================");
        log.info("✅ Data Initialization Complete!");
        log.info("✅ Created {} schools and {} stationery items", 
                 schoolsCreated, stationeryCreated);
        log.info("========================================");
    }

    /**
     * Initialize demo schools
     */
    private int initializeSchools() {
        // Check if schools already exist
        if (schoolRepository.count() > 0) {
            log.info("ℹ️  Schools already exist. Skipping school initialization.");
            return 0;
        }

        log.info("Creating demo schools...");

        List<School> demoSchools = Arrays.asList(
            createSchool(
                "Sunridge Primary School",
                "Cape Town Metro",
                "Western Cape",
                "1,2,3,4,5,6,7"
            ),
            createSchool(
                "Johannesburg High School",
                "City of Johannesburg",
                "Gauteng",
                "8,9,10,11,12"
            ),
            createSchool(
                "Durban Coastal Academy",
                "eThekwini",
                "KwaZulu-Natal",
                "1,2,3,4,5,6,7,8,9,10,11,12"
            ),
            createSchool(
                "Pretoria East Primary",
                "City of Tshwane",
                "Gauteng",
                "1,2,3,4,5,6,7"
            ),
            createSchool(
                "Nelson Mandela Bay Secondary",
                "Nelson Mandela Bay",
                "Eastern Cape",
                "8,9,10,11,12"
            )
        );

        schoolRepository.saveAll(demoSchools);

        demoSchools.forEach(school ->
            log.info("  ✅ Created school: {} - {}, {}", 
                     school.getName(), school.getDistrict(), school.getProvince())
        );

        return demoSchools.size();
    }

    /**
     * Initialize demo stationery items
     */
    private int initializeStationery() {
        // Check if stationery already exists
        if (stationeryRepository.count() > 0) {
            log.info("ℹ️  Stationery items already exist. Skipping stationery initialization.");
            return 0;
        }

        log.info("Creating demo stationery items...");

        List<Stationery> demoStationery = Arrays.asList(
            createStationery(
                "Blue Ballpoint Pen",
                "Smooth writing blue ink pen, pack of 10",
                new BigDecimal("35.00"),
                "Pens",
                "BIC",
                "https://example.com/images/blue-pen.jpg"
            ),
            createStationery(
                "A4 Notebook - 96 Pages",
                "Ruled notebook with hard cover",
                new BigDecimal("25.00"),
                "Notebooks",
                "Croxley",
                "https://example.com/images/notebook.jpg"
            ),
            createStationery(
                "Colored Pencils Set",
                "Set of 24 colored pencils",
                new BigDecimal("89.99"),
                "Pencils",
                "Faber-Castell",
                "https://example.com/images/colored-pencils.jpg"
            ),
            createStationery(
                "School Backpack - Blue",
                "Durable backpack with multiple compartments",
                new BigDecimal("299.00"),
                "Bags",
                "Adidas",
                "https://example.com/images/backpack.jpg"
            ),
            createStationery(
                "Scientific Calculator",
                "Advanced calculator for high school math",
                new BigDecimal("450.00"),
                "Calculators",
                "Casio",
                "https://example.com/images/calculator.jpg"
            ),
            createStationery(
                "Geometry Set",
                "Complete set with compass, protractor, rulers",
                new BigDecimal("65.00"),
                "Geometry",
                "Helix",
                "https://example.com/images/geometry-set.jpg"
            ),
            createStationery(
                "Eraser Pack",
                "Soft erasers, pack of 5",
                new BigDecimal("15.00"),
                "Erasers",
                "Staedtler",
                "https://example.com/images/erasers.jpg"
            ),
            createStationery(
                "Highlighters - Assorted",
                "Set of 6 fluorescent highlighters",
                new BigDecimal("45.00"),
                "Highlighters",
                "Stabilo",
                "https://example.com/images/highlighters.jpg"
            ),
            createStationery(
                "Ring Binder - A4",
                "2-ring binder with 25mm capacity",
                new BigDecimal("55.00"),
                "Binders",
                "Bantex",
                "https://example.com/images/binder.jpg"
            ),
            createStationery(
                "Graphite Pencils HB",
                "Pack of 12 HB pencils",
                new BigDecimal("30.00"),
                "Pencils",
                "Staedtler",
                "https://example.com/images/pencils.jpg"
            )
        );

        stationeryRepository.saveAll(demoStationery);

        demoStationery.forEach(item ->
            log.info("  ✅ Created stationery: {} - R{} ({})", 
                     item.getName(), item.getPrice(), item.getCategory())
        );

        return demoStationery.size();
    }

    // =========================================================================
    // Helper Methods
    // =========================================================================

    /**
     * Create a school
     */
    private School createSchool(String name, String district, String province, String grades) {
        School school = new School();
        school.setName(name);
        school.setDistrict(district);
        school.setProvince(province);
        school.setGrades(grades);
        return school;
    }

    /**
     * Create a stationery item
     */
    private Stationery createStationery(String name, String description, BigDecimal price,
                                       String category, String brand, String imageUrl) {
        Stationery item = new Stationery();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setBrand(brand);
        item.setImageUrl(imageUrl);
        return item;
    }
}
