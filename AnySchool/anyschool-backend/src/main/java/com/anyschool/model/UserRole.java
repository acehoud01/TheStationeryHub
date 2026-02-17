package com.anyschool.model;

/**
 * UserRole Enum
 * 
 * Defines the roles available in the AnySchool system.
 * 
 * - PARENT: Parents who can view and donate
 * - SCHOOL_ADMIN: School administrators who manage school needs
 * - DONOR: Donors who can contribute to school stationery needs
 * - PURCHASING_ADMIN: Purchasing administrators who process orders and track deliveries
 * - SUPER_ADMIN: Super administrators with full system access
 * 
 * Phase 2: Basic roles
 * Phase 3: Will be used with Spring Security for authorization
 */
public enum UserRole {
    PARENT,
    SCHOOL_ADMIN,
    DONOR,
    PURCHASING_ADMIN,
    SUPER_ADMIN
}
