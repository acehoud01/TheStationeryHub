package com.anyschool.model;

/**
 * School Request Status Enum
 * 
 * Represents the status of a school addition request.
 * 
 * PENDING: Request submitted, awaiting admin review
 * APPROVED: Admin approved and created the school
 * REJECTED: Admin rejected the request
 * 
 * Phase 7C: Parent-Child Linking Enhancement
 */
public enum SchoolRequestStatus {
    /**
     * Request submitted, awaiting admin review
     */
    PENDING,

    /**
     * Admin approved and created the school
     */
    APPROVED,

    /**
     * Admin rejected the request
     */
    REJECTED
}
