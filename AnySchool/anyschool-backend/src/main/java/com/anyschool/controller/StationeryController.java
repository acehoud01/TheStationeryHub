package com.anyschool.controller;

import com.anyschool.model.Stationery;
import com.anyschool.repository.StationeryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Stationery Controller
 * 
 * Public endpoints for viewing stationery catalog.
 * No authentication required.
 * 
 * Endpoints:
 * - GET /api/stationery - List all stationery items
 * - GET /api/stationery/{id} - Get single stationery item
 * 
 * Phase 4: Public catalog
 */
@RestController
@RequestMapping("/api/stationery")
@RequiredArgsConstructor
@Slf4j
public class StationeryController {

    private final StationeryRepository stationeryRepository;

    /**
     * Get all stationery items
     * 
     * GET /api/stationery
     * 
     * Public access - no authentication required
     * 
     * Response:
     * {
     *   "success": true,
     *   "count": 10,
     *   "stationery": [...]
     * }
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStationery() {
        log.info("Fetching all stationery items");
        
        List<Stationery> stationeryList = stationeryRepository.findAll();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", stationeryList.size());
        response.put("stationery", stationeryList);
        
        log.info("Fetched {} stationery items", stationeryList.size());
        return ResponseEntity.ok(response);
    }

    /**
     * Get stationery by ID
     * 
     * GET /api/stationery/{id}
     * 
     * Public access - no authentication required
     * 
     * Response:
     * {
     *   "success": true,
     *   "stationery": {...}
     * }
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getStationeryById(@PathVariable Long id) {
        log.info("Fetching stationery with id: {}", id);
        
        return stationeryRepository.findById(id)
                .map(stationery -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("stationery", stationery);
                    
                    log.info("Fetched stationery: {}", stationery.getName());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    log.warn("Stationery not found with id: {}", id);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", false);
                    response.put("message", "Stationery not found");
                    
                    return ResponseEntity.notFound().build();
                });
    }

    /**
     * Get stationery by category
     * 
     * GET /api/stationery/category/{category}
     * 
     * Public access - no authentication required
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getStationeryByCategory(@PathVariable String category) {
        log.info("Fetching stationery by category: {}", category);
        
        List<Stationery> stationeryList = stationeryRepository.findByCategory(category);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", stationeryList.size());
        response.put("category", category);
        response.put("stationery", stationeryList);
        
        log.info("Fetched {} stationery items in category: {}", stationeryList.size(), category);
        return ResponseEntity.ok(response);
    }
}
