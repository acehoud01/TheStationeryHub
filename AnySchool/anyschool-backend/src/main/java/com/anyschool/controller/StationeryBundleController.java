package com.anyschool.controller;

import com.anyschool.model.StationeryBundle;
import com.anyschool.model.Stationery;
import com.anyschool.model.User;
import com.anyschool.model.UserRole;
import com.anyschool.repository.StationeryBundleRepository;
import com.anyschool.repository.StationeryRepository;
import com.anyschool.repository.SchoolRepository;
import com.anyschool.model.School;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Stationery Bundle Controller
 * 
 * REST endpoints for managing stationery bundles (grade-specific bundles created by schools).
 * 
 * Endpoints:
 * - GET /api/bundles/school/{schoolId} - Get bundles for a school (school admin only)
 * - GET /api/bundles/{bundleId} - Get single bundle details
 * - POST /api/bundles - Create new bundle (school admin only)
 * - PUT /api/bundles/{bundleId} - Update bundle (school admin only)
 * - DELETE /api/bundles/{bundleId} - Delete bundle (school admin only)
 * - PUT /api/bundles/{bundleId}/mark-final - Mark bundle as final (school admin only)
 * - POST /api/bundles/{bundleId}/items - Add stationery items to bundle
 * - DELETE /api/bundles/{bundleId}/items/{stationeryId} - Remove stationery item from bundle
 */
@RestController
@RequestMapping("/api/bundles")
@RequiredArgsConstructor
@Slf4j
public class StationeryBundleController {

    private final StationeryBundleRepository bundleRepository;
    private final StationeryRepository stationeryRepository;
    private final SchoolRepository schoolRepository;

    /**
     * Get all bundles for a school
     * 
     * GET /api/bundles/school/{schoolId}
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * Only school admins can view their school's bundles.
     */
    @GetMapping("/school/{schoolId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getSchoolBundles(
            @PathVariable Long schoolId,
            @AuthenticationPrincipal User user
    ) {
        log.info("Fetching bundles for school {} by user: {}", schoolId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can access this"));
        }

        // Verify admin owns the school
        if (user.getSchoolId() == null || !user.getSchoolId().equals(schoolId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only view bundles for your school"));
        }

        List<StationeryBundle> bundles = bundleRepository.findBySchoolIdOrderByGrade(schoolId);

        List<Map<String, Object>> bundleList = bundles.stream()
                .map(this::sanitiseBundle)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("count", bundleList.size());
        response.put("bundles", bundleList);

        return ResponseEntity.ok(response);
    }

    /**
     * Get bundle details
     * 
     * GET /api/bundles/{bundleId}
     */
    @GetMapping("/{bundleId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getBundleById(@PathVariable Long bundleId) {
        log.info("Fetching bundle: {}", bundleId);

        return bundleRepository.findById(bundleId)
                .map(bundle -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("bundle", sanitiseBundleDetailed(bundle));
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("success", false, "message", "Bundle not found")));
    }

    /**
     * Create a new bundle
     * 
     * POST /api/bundles
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     * 
     * Request body:
     * {
     *   "schoolId": 1,
     *   "grade": "1",
     *   "name": "Grade 1 Stationery Bundle",
     *   "description": "Complete stationery set for Grade 1",
     *   "stationeryIds": [1, 2, 3]
     * }
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createBundle(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> request
    ) {
        log.info("Creating bundle by user: {}", user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can create bundles"));
        }

        Long schoolId = ((Number) request.get("schoolId")).longValue();
        String grade = (String) request.get("grade");
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        @SuppressWarnings("unchecked")
        List<Integer> stationeryIds = (List<Integer>) request.get("stationeryIds");

        // Verify admin owns the school
        if (!user.getSchoolId().equals(schoolId)) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only create bundles for your school"));
        }

        // Verify school exists
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new IllegalArgumentException("School not found"));

        // Create bundle
        StationeryBundle bundle = new StationeryBundle();
        bundle.setSchool(school);
        bundle.setGrade(grade);
        bundle.setName(name);
        bundle.setDescription(description);
        bundle.setIsFinalized(false);

        // Add stationery items and calculate price
        BigDecimal totalPrice = BigDecimal.ZERO;
        if (stationeryIds != null && !stationeryIds.isEmpty()) {
            for (Integer stationeryId : stationeryIds) {
                Stationery stationery = stationeryRepository.findById(stationeryId.longValue())
                        .orElseThrow(() -> new IllegalArgumentException("Stationery not found: " + stationeryId));
                bundle.addStationeryItem(stationery);
                totalPrice = totalPrice.add(stationery.getPrice());
            }
        }
        bundle.setPrice(totalPrice);

        // Save bundle
        StationeryBundle savedBundle = bundleRepository.save(bundle);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bundle created successfully");
        response.put("bundle", sanitiseBundleDetailed(savedBundle));

        log.info("Bundle created with id: {}", savedBundle.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Update a bundle
     * 
     * PUT /api/bundles/{bundleId}
     * 
     * Requires authentication and SCHOOL_ADMIN role.
     */
    @PutMapping("/{bundleId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateBundle(
            @AuthenticationPrincipal User user,
            @PathVariable Long bundleId,
            @RequestBody Map<String, Object> request
    ) {
        log.info("Updating bundle {} by user: {}", bundleId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can update bundles"));
        }

        StationeryBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        // Verify admin owns the school
        if (!user.getSchoolId().equals(bundle.getSchool().getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only update bundles for your school"));
        }

        // Update fields
        if (request.containsKey("name")) {
            bundle.setName((String) request.get("name"));
        }
        if (request.containsKey("description")) {
            bundle.setDescription((String) request.get("description"));
        }
        if (request.containsKey("grade")) {
            bundle.setGrade((String) request.get("grade"));
        }

        // Save updated bundle
        StationeryBundle updatedBundle = bundleRepository.save(bundle);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bundle updated successfully");
        response.put("bundle", sanitiseBundleDetailed(updatedBundle));

        return ResponseEntity.ok(response);
    }

    /**
     * Mark bundle as final
     * 
     * PUT /api/bundles/{bundleId}/mark-final
     * 
     * When marked final, parents cannot edit or remove items from orders containing this bundle.
     */
    @PutMapping("/{bundleId}/mark-final")
    @Transactional
    public ResponseEntity<Map<String, Object>> markBundleAsFinalized(
            @AuthenticationPrincipal User user,
            @PathVariable Long bundleId
    ) {
        log.info("Marking bundle {} as final by user: {}", bundleId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can mark bundles final"));
        }

        StationeryBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        // Verify admin owns the school
        if (!user.getSchoolId().equals(bundle.getSchool().getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only modify bundles for your school"));
        }

        // Mark as final
        bundle.setIsFinalized(true);
        StationeryBundle updatedBundle = bundleRepository.save(bundle);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bundle marked as final");
        response.put("bundle", sanitiseBundleDetailed(updatedBundle));

        return ResponseEntity.ok(response);
    }

    /**
     * Add stationery items to a bundle
     * 
     * POST /api/bundles/{bundleId}/items
     * 
     * Request body:
     * {
     *   "stationeryIds": [1, 2, 3]
     * }
     */
    @PostMapping("/{bundleId}/items")
    @Transactional
    public ResponseEntity<Map<String, Object>> addItemsToBundle(
            @AuthenticationPrincipal User user,
            @PathVariable Long bundleId,
            @RequestBody Map<String, Object> request
    ) {
        log.info("Adding items to bundle {} by user: {}", bundleId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can modify bundles"));
        }

        StationeryBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        // Verify admin owns the school
        if (!user.getSchoolId().equals(bundle.getSchool().getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only modify bundles for your school"));
        }

        @SuppressWarnings("unchecked")
        List<Integer> stationeryIds = (List<Integer>) request.get("stationeryIds");

        BigDecimal priceToAdd = BigDecimal.ZERO;
        if (stationeryIds != null && !stationeryIds.isEmpty()) {
            for (Integer stationeryId : stationeryIds) {
                Stationery stationery = stationeryRepository.findById(stationeryId.longValue())
                        .orElseThrow(() -> new IllegalArgumentException("Stationery not found: " + stationeryId));
                bundle.addStationeryItem(stationery);
                priceToAdd = priceToAdd.add(stationery.getPrice());
            }
        }

        // Update price
        bundle.setPrice(bundle.getPrice().add(priceToAdd));

        // Save updated bundle
        StationeryBundle updatedBundle = bundleRepository.save(bundle);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Items added to bundle");
        response.put("bundle", sanitiseBundleDetailed(updatedBundle));

        return ResponseEntity.ok(response);
    }

    /**
     * Remove stationery item from bundle
     * 
     * DELETE /api/bundles/{bundleId}/items/{stationeryId}
     */
    @DeleteMapping("/{bundleId}/items/{stationeryId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> removeItemFromBundle(
            @AuthenticationPrincipal User user,
            @PathVariable Long bundleId,
            @PathVariable Long stationeryId
    ) {
        log.info("Removing item {} from bundle {} by user: {}", stationeryId, bundleId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can modify bundles"));
        }

        StationeryBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        // Verify admin owns the school
        if (!user.getSchoolId().equals(bundle.getSchool().getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only modify bundles for your school"));
        }

        Stationery stationery = stationeryRepository.findById(stationeryId)
                .orElseThrow(() -> new IllegalArgumentException("Stationery not found"));

        // Remove item and update price
        bundle.removeStationeryItem(stationery);
        bundle.setPrice(bundle.getPrice().subtract(stationery.getPrice()));

        // Save updated bundle
        StationeryBundle updatedBundle = bundleRepository.save(bundle);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Item removed from bundle");
        response.put("bundle", sanitiseBundleDetailed(updatedBundle));

        return ResponseEntity.ok(response);
    }

    /**
     * Delete a bundle
     * 
     * DELETE /api/bundles/{bundleId}
     */
    @DeleteMapping("/{bundleId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteBundle(
            @AuthenticationPrincipal User user,
            @PathVariable Long bundleId
    ) {
        log.info("Deleting bundle {} by user: {}", bundleId, user.getEmail());

        // Verify user is school admin
        if (!UserRole.SCHOOL_ADMIN.equals(user.getRole())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Only school admins can delete bundles"));
        }

        StationeryBundle bundle = bundleRepository.findById(bundleId)
                .orElseThrow(() -> new IllegalArgumentException("Bundle not found"));

        // Verify admin owns the school
        if (!user.getSchoolId().equals(bundle.getSchool().getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "You can only delete bundles for your school"));
        }

        bundleRepository.deleteById(bundleId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Bundle deleted");

        return ResponseEntity.ok(response);
    }

    // ─── Helper methods ───────────────────────────────────────────────────────

    /**
     * Sanitise bundle for list view
     */
    private Map<String, Object> sanitiseBundle(StationeryBundle bundle) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", bundle.getId());
        map.put("grade", bundle.getGrade());
        map.put("name", bundle.getName());
        map.put("description", bundle.getDescription());
        map.put("price", bundle.getPrice());
        map.put("isFinalized", bundle.getIsFinalized());
        map.put("itemCount", bundle.getStationeryItems().size());
        map.put("createdAt", bundle.getCreatedAt());
        return map;
    }

    /**
     * Sanitise bundle for detailed view
     */
    private Map<String, Object> sanitiseBundleDetailed(StationeryBundle bundle) {
        Map<String, Object> map = sanitiseBundle(bundle);

        // Add stationery items
        List<Map<String, Object>> items = bundle.getStationeryItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("name", item.getName());
                    itemMap.put("category", item.getCategory());
                    itemMap.put("brand", item.getBrand());
                    itemMap.put("price", item.getPrice());
                    return itemMap;
                })
                .collect(Collectors.toList());

        map.put("items", items);

        return map;
    }
}
