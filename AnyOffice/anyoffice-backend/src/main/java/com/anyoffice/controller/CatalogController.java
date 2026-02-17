package com.anyoffice.controller;

import com.anyoffice.model.Stationery;
import com.anyoffice.service.CatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/office/catalog")
@RequiredArgsConstructor
@Slf4j
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(required = false) String category) {
        List<Stationery> items = category != null && !category.isBlank()
                ? catalogService.getByCategory(category)
                : catalogService.getAllAvailable();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("items", items);
        response.put("count", items.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProduct(@PathVariable Long id) {
        Stationery item = catalogService.getById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("item", item);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam String q) {
        List<Stationery> items = catalogService.search(q);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("items", items);
        response.put("count", items.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> getCategories() {
        List<String> categories = catalogService.getCategories();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("categories", categories);
        return ResponseEntity.ok(response);
    }
}
