package com.anyschool.model;

/**
 * Verification Status Enum
 * 
 * Represents the verification status of a child's school enrollment.
 * 
 * PENDING: Child has been added but not yet verified by school
 * VERIFIED: School has confirmed the child's enrollment
 * REJECTED: School has rejected the verification (child not enrolled)
 * 
 * Phase 7C: Parent-Child Linking
 */
public enum VerificationStatus {
    /**
     * Awaiting school verification
     * Parent can still place orders with PENDING status
     */
    PENDING,

    /**
     * School has verified the child's enrollment
     */
    VERIFIED,

    /**
     * School has rejected the verification
     * May indicate child is not enrolled at that school
     */
    REJECTED
}