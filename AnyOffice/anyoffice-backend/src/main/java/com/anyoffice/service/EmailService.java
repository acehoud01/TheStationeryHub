package com.anyoffice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@anyoffice.co.za}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to: {} | Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendOtpEmail(String to, String firstName, String otpCode) {
        String subject = "AnyOffice - Verify Your Account";
        String body = "Hello " + firstName + ",\n\n" +
                "Welcome to AnyOffice! Please use the following verification code to complete your registration:\n\n" +
                "Verification Code: " + otpCode + "\n\n" +
                "This code expires in 10 minutes.\n\n" +
                "If you did not create an account, please ignore this email.\n\n" +
                "The AnyOffice Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String firstName, String resetCode) {
        String subject = "AnyOffice - Password Reset Code";
        String body = "Hello " + firstName + ",\n\n" +
                "You requested a password reset. Use this code to reset your password:\n\n" +
                "Reset Code: " + resetCode + "\n\n" +
                "This code expires in 15 minutes.\n\n" +
                "If you did not request a password reset, please ignore this email.\n\n" +
                "The AnyOffice Team";
        sendEmail(to, subject, body);
    }

    public void sendOrderNotification(String to, String firstName, String orderNumber, String status, String message) {
        String subject = "AnyOffice - Order " + orderNumber + " Update";
        String body = "Hello " + firstName + ",\n\n" +
                "Your order " + orderNumber + " has been updated.\n\n" +
                "Status: " + status + "\n" +
                (message != null ? "Message: " + message + "\n" : "") +
                "\nLog in to AnyOffice to view your order details.\n\n" +
                "The AnyOffice Team";
        sendEmail(to, subject, body);
    }

    public void sendApprovalRequestEmail(String to, String approverName, String requesterName,
                                          String orderNumber, String amount) {
        String subject = "AnyOffice - Approval Required: " + orderNumber;
        String body = "Hello " + approverName + ",\n\n" +
                requesterName + " has submitted an order that requires your approval.\n\n" +
                "Order Number: " + orderNumber + "\n" +
                "Amount: R" + amount + "\n\n" +
                "Please log in to AnyOffice to review and approve or reject this order.\n\n" +
                "The AnyOffice Team";
        sendEmail(to, subject, body);
    }

    public void sendWelcomeEmail(String to, String firstName, String tempPassword) {
        String subject = "AnyOffice - Welcome to Your Company Account";
        String body = "Hello " + firstName + ",\n\n" +
                "You have been added to your company's AnyOffice account.\n\n" +
                "Login Details:\n" +
                "Email: " + to + "\n" +
                "Temporary Password: " + tempPassword + "\n\n" +
                "Please log in and change your password immediately.\n\n" +
                "The AnyOffice Team";
        sendEmail(to, subject, body);
    }
}
