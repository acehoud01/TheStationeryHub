package com.anyoffice.dto;

public class ApprovalRequest {
    private String comments;
    private String rejectionReason;

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
