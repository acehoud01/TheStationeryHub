package com.anyschool.repository;

import com.anyschool.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository
 * 
 * Spring Data JPA repository for User entity.
 * Provides CRUD operations and custom queries.
 * 
 * Spring Data JPA automatically provides implementation at runtime.
 * No need to write implementation code!
 * 
 * Built-in methods (from JpaRepository):
 * - save(User user)
 * - findById(Long id)
 * - findAll()
 * - deleteById(Long id)
 * - count()
 * - existsById(Long id)
 * 
 * Custom methods:
 * - findByEmail(String email) - Find user by email address
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address
     * 
     * Email is unique, so this returns Optional<User>.
     * 
     * Spring Data JPA generates the query automatically:
     * SELECT * FROM users WHERE email = ?
     * 
     * @param email User's email address
     * @return Optional containing User if found, empty Optional if not found
     */
    Optional<User> findByEmail(String email);

    /**
     * Count users by role
     * Used for analytics
     * 
     * @param role User role (e.g., "PARENT", "SCHOOL", "ADMIN")
     * @return Count of users with that role
     */
    Long countByRole(String role);
}
