# AnyOffice Production Roadmap 🏢

**Complete Step-by-Step Guide to Build AnyOffice (Business Vertical)**

**Base Platform:** The Stationery Hub (thestationeryhub.com)
- ✅ **AnySchool** (Education Vertical) - COMPLETE
- 🔨 **AnyOffice** (Business Vertical) - BUILD NOW

---

## 🎯 Overview

**AnyOffice** is a B2B office supplies procurement platform that enables:
- Companies to manage office supply ordering for employees
- Department-based budget allocation and approval workflows
- Bulk procurement with volume discounts
- Multi-location company support
- Supplier integration and RFQ management
- Inventory tracking and reorder automation
- Analytics and spend management

---

## 📊 Architecture Comparison

| Component | AnySchool | AnyOffice |
|-----------|-----------|-----------|
| **Users** | Parents, Schools, Donors | Employees, Admins, Procurement Officers |
| **Entities** | Children, Schools | Employees, Companies, Departments |
| **Products** | School Stationery | Office Supplies (broader catalog) |
| **Ordering** | Parent orders for child | Employee orders for department |
| **Payment** | Parent/Donor sponsorship | Company budget/PO system |
| **Approval** | School verification | Manager/Procurement approval |
| **Fulfillment** | School delivery | Office/Employee delivery |

---

## 🏗️ PHASE 1: PROJECT INITIALIZATION (Day 1)

### Step 1.1: Create AnyOffice Backend Project Structure

**Prompt:**
```
Create a new Spring Boot project for AnyOffice backend with the following structure:

PROJECT DETAILS:
- Group ID: com.anyoffice
- Artifact ID: anyoffice-backend
- Name: AnyOffice Backend
- Description: AnyOffice B2B Procurement System Backend
- Java Version: 17
- Spring Boot: 3.2.0

DEPENDENCIES (same as AnySchool):
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Security
- Spring Boot Starter Validation
- Spring Boot Starter Mail
- PostgreSQL Driver (runtime)
- Flyway Core (for database migrations)
- JWT: jjwt-api, jjwt-impl, jjwt-jackson (version 0.12.6)
- Lombok (optional)

Create the following directory structure:
anyoffice-backend/
├── pom.xml
├── Dockerfile
├── README.md
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── anyoffice/
│   │   │           ├── AnyOfficeApplication.java (main class)
│   │   │           ├── config/
│   │   │           ├── controller/
│   │   │           ├── dto/
│   │   │           ├── exception/
│   │   │           ├── model/
│   │   │           ├── repository/
│   │   │           ├── security/
│   │   │           └── service/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/
│   │           └── migration/
│   └── test/
│       └── java/
│           └── com/
│               └── anyoffice/

application.properties should include:
- Server port: 8081 (to avoid conflict with AnySchool on 8080)
- Database: PostgreSQL (anyoffice_db)
- JPA/Hibernate settings
- JWT secret configuration
- Mail server settings (for notifications)
- CORS configuration
```

### Step 1.2: Create AnyOffice Frontend Project

**Prompt:**
```
Create a new React frontend project for AnyOffice:

PROJECT DETAILS:
- Name: anyoffice-frontend
- Description: AnyOffice B2B Procurement System - Frontend Application

Use create-react-app or Vite and install these dependencies:
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.20.0
- @mui/material: ^5.14.20
- @mui/icons-material: ^5.14.19
- @emotion/react: ^11.11.1
- @emotion/styled: ^11.11.0
- axios: ^1.6.2
- recharts: ^2.10.0 (for analytics charts)

Create the following directory structure:
anyoffice-frontend/
├── package.json
├── README.md
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
└── src/
    ├── App.js
    ├── App.css
    ├── index.js
    ├── index.css
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Footer.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── BudgetTracker.jsx
    │   ├── ApprovalQueue.jsx
    │   └── NotificationBell.jsx
    ├── config/
    │   └── api.js
    ├── context/
    │   ├── AuthContext.js
    │   └── CartContext.js
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── VerifyOtpPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── CatalogPage.jsx
    │   ├── CartPage.jsx
    │   ├── OrderHistoryPage.jsx
    │   └── ProfilePage.jsx
    ├── services/
    │   └── api.service.js
    ├── styles/
    └── utils/
        └── dateHelpers.js

Configure API base URL to point to backend: http://localhost:8081/api
```

---

## 🗄️ PHASE 2: DATABASE SCHEMA & MODELS (Days 2-3)

### Step 2.1: Define Core Data Models

**Prompt:**
```
Create the core entity models for AnyOffice backend. Create Java classes in the model package:

1. **User.java** (extends UserDetails for Spring Security)
   - id (Long, primary key)
   - email (String, unique, not null)
   - password (String, encrypted)
   - firstName, lastName (String)
   - phoneNumber (String)
   - role (Enum: SUPER_ADMIN, COMPANY_ADMIN, PROCUREMENT_OFFICER, DEPARTMENT_MANAGER, EMPLOYEE)
   - companyId (Long, foreign key to Company)
   - departmentId (Long, foreign key to Department)
   - isEnabled (Boolean, default true)
   - isEmailVerified (Boolean, default false)
   - accountLocked (Boolean, default false)
   - failedLoginAttempts (Integer, default 0)
   - lockoutEndTime (LocalDateTime, nullable)
   - createdAt, updatedAt (LocalDateTime)

2. **Company.java**
   - id (Long, primary key)
   - name (String, unique, not null)
   - registrationNumber (String, unique)
   - taxNumber (String)
   - industry (String)
   - numberOfEmployees (Integer)
   - address (String)
   - city, state, postalCode, country (String)
   - contactEmail, contactPhone (String)
   - logoUrl (String, nullable)
   - isActive (Boolean, default true)
   - subscriptionTier (Enum: BASIC, PROFESSIONAL, ENTERPRISE)
   - subscriptionStartDate, subscriptionEndDate (LocalDate)
   - monthlyBudget (BigDecimal)
   - createdAt, updatedAt (LocalDateTime)
   - @OneToMany departments (List<Department>)
   - @OneToMany users (List<User>)

3. **Department.java**
   - id (Long, primary key)
   - name (String, not null)
   - code (String, unique within company)
   - @ManyToOne company (Company)
   - managerId (Long, foreign key to User)
   - monthlyBudget (BigDecimal)
   - currentSpend (BigDecimal, default 0)
   - costCenter (String)
   - isActive (Boolean, default true)
   - createdAt, updatedAt (LocalDateTime)
   - @OneToMany employees (List<User>)

4. **OfficeProduct.java**
   - id (Long, primary key)
   - name (String, not null)
   - sku (String, unique, not null)
   - category (Enum: WRITING, PAPER, FILING, TECHNOLOGY, FURNITURE, CLEANING, BREAKROOM, SAFETY, MISC)
   - subcategory (String)
   - description (String, text)
   - unitPrice (BigDecimal, not null)
   - currency (String, default "ZAR")
   - unit (String, e.g., "piece", "box", "ream")
   - quantityPerUnit (Integer, for bulk items)
   - supplierId (Long, foreign key to Supplier)
   - stockLevel (Integer)
   - reorderLevel (Integer)
   - minimumOrderQuantity (Integer, default 1)
   - volumeDiscounts (JSON, for bulk pricing tiers)
   - imageUrl (String)
   - isActive (Boolean, default true)
   - isFeatured (Boolean, default false)
   - tags (String, comma-separated)
   - createdAt, updatedAt (LocalDateTime)

5. **Order.java**
   - id (Long, primary key)
   - orderNumber (String, unique, auto-generated)
   - @ManyToOne user (User) - employee who placed order
   - @ManyToOne company (Company)
   - @ManyToOne department (Department)
   - status (Enum: PENDING_APPROVAL, APPROVED, REJECTED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
   - orderDate (LocalDateTime)
   - approvedBy (Long, foreign key to User - manager)
   - approvedAt (LocalDateTime, nullable)
   - rejectionReason (String, nullable)
   - totalAmount (BigDecimal)
   - taxAmount (BigDecimal)
   - shippingCost (BigDecimal)
   - grandTotal (BigDecimal)
   - shippingAddress (String, text)
   - deliveryNotes (String, text)
   - expectedDeliveryDate (LocalDate, nullable)
   - actualDeliveryDate (LocalDate, nullable)
   - purchaseOrderNumber (String, nullable)
   - invoiceNumber (String, nullable)
   - paymentStatus (Enum: PENDING, PAID, PARTIALLY_PAID)
   - paymentMethod (Enum: COMPANY_ACCOUNT, PURCHASE_ORDER, CREDIT_CARD)
   - priority (Enum: LOW, MEDIUM, HIGH, URGENT)
   - createdAt, updatedAt (LocalDateTime)
   - @OneToMany orderItems (List<OrderItem>)

6. **OrderItem.java**
   - id (Long, primary key)
   - @ManyToOne order (Order)
   - @ManyToOne product (OfficeProduct)
   - quantity (Integer, not null)
   - unitPrice (BigDecimal)
   - discount (BigDecimal, default 0)
   - subtotal (BigDecimal)
   - notes (String, nullable)

7. **Supplier.java** (can reuse from AnySchool with modifications)
   - id (Long, primary key)
   - name (String, unique, not null)
   - registrationNumber (String)
   - email, phone (String)
   - address (String, text)
   - contactPersonName, contactPersonEmail, contactPersonPhone (String)
   - paymentTerms (String, e.g., "Net 30")
   - deliveryLeadTime (Integer, days)
   - minimumOrderValue (BigDecimal)
   - rating (Double, 0-5)
   - isActive (Boolean, default true)
   - createdAt, updatedAt (LocalDateTime)
   - @OneToMany products (List<OfficeProduct>)

8. **ApprovalWorkflow.java**
   - id (Long, primary key)
   - @ManyToOne order (Order)
   - @ManyToOne requester (User)
   - @ManyToOne approver (User)
   - level (Integer, for multi-level approvals)
   - status (Enum: PENDING, APPROVED, REJECTED)
   - comments (String, text)
   - approvedAt (LocalDateTime, nullable)
   - createdAt (LocalDateTime)

9. **BudgetAllocation.java**
   - id (Long, primary key)
   - @ManyToOne company (Company)
   - @ManyToOne department (Department, nullable)
   - fiscalYear (Integer)
   - fiscalQuarter (Integer, 1-4)
   - allocatedAmount (BigDecimal)
   - spentAmount (BigDecimal, default 0)
   - remainingAmount (BigDecimal, calculated)
   - category (String, nullable - for category-specific budgets)
   - createdAt, updatedAt (LocalDateTime)

10. **InventoryTracking.java**
    - id (Long, primary key)
    - @ManyToOne product (OfficeProduct)
    - @ManyToOne company (Company)
    - @ManyToOne department (Department, nullable)
    - currentStock (Integer)
    - location (String)
    - lastRestockedDate (LocalDate)
    - lastRestockedQuantity (Integer)
    - averageMonthlyConsumption (Double)
    - projectedDepletionDate (LocalDate, calculated)
    - autoReorderEnabled (Boolean, default false)
    - updatedAt (LocalDateTime)

Use proper JPA annotations:
- @Entity
- @Table (with appropriate indexes)
- @Id, @GeneratedValue
- @Column (with constraints)
- @ManyToOne, @OneToMany (with cascade and fetch strategies)
- @Enumerated(EnumType.STRING)
- @CreationTimestamp, @UpdateTimestamp (if using Hibernate)
```

### Step 2.2: Create Initial Database Migration

**Prompt:**
```
Create Flyway migration script V1__init_schema.sql in src/main/resources/db/migration/:

This script should create all tables for the AnyOffice models:
1. companies
2. departments
3. users (with foreign keys to companies and departments)
4. suppliers
5. office_products (with foreign key to suppliers)
6. orders (with foreign keys to users, companies, departments)
7. order_items (with foreign keys to orders and office_products)
8. approval_workflows (with foreign keys to orders and users)
9. budget_allocations (with foreign keys to companies and departments)
10. inventory_tracking (with foreign keys to office_products, companies, departments)

Include:
- All primary keys (BIGSERIAL)
- All foreign key constraints
- Unique constraints where needed
- NOT NULL constraints
- Default values
- Indexes on frequently queried columns (email, orderNumber, sku, etc.)
- Check constraints for enums

Also create sequences for order numbers and other auto-generated IDs.
```

---

## 🔐 PHASE 3: AUTHENTICATION & SECURITY (Days 4-5)

### Step 3.1: Implement Security Configuration

**Prompt:**
```
Create complete Spring Security configuration for AnyOffice:

1. **SecurityConfig.java** (in config package)
   - Configure JWT-based authentication
   - Define security filter chain
   - Set up password encoder (BCryptPasswordEncoder)
   - Configure CORS for frontend (http://localhost:3001)
   - Define public endpoints: /api/auth/**, /api/public/**
   - Protect all other endpoints with authentication
   - Enable method-level security (@PreAuthorize)

2. **JwtTokenProvider.java** (in security package)
   - Generate JWT tokens with user details and role
   - Token expiration: 24 hours
   - Validate tokens
   - Extract username and authorities from token
   - Secret key from application.properties: jwt.secret

3. **JwtAuthenticationFilter.java** (in security package)
   - Intercept requests and validate JWT token
   - Set authentication in SecurityContext
   - Continue filter chain

4. **CustomUserDetailsService.java** (in security package)
   - Implement UserDetailsService
   - Load user by email from database
   - Convert User entity to UserDetails

5. **Roles and Permissions:**
   - SUPER_ADMIN: Full system access
   - COMPANY_ADMIN: Manage company, users, budgets
   - PROCUREMENT_OFFICER: Manage suppliers, approve high-value orders
   - DEPARTMENT_MANAGER: Approve department orders, manage budget
   - EMPLOYEE: Place orders, view own orders
```

### Step 3.2: Implement Authentication Controller

**Prompt:**
```
Create AuthController.java with these endpoints:

1. POST /api/auth/register (public)
   - Register new company with admin user
   - Create company, admin user, and default department
   - Send email verification OTP
   - Returns success message

2. POST /api/auth/verify-otp (public)
   - Verify email OTP code
   - Set isEmailVerified = true
   - Returns JWT token and user details

3. POST /api/auth/login (public)
   - Authenticate with email and password
   - Check account locks and email verification
   - Track failed login attempts (max 5, then lock for 30 minutes)
   - Return JWT token and user details

4. POST /api/auth/forgot-password (public)
   - Send password reset OTP via email

5. POST /api/auth/reset-password (public)
   - Reset password with OTP verification

6. POST /api/auth/resend-otp (public)
   - Resend verification OTP

7. GET /api/auth/me (authenticated)
   - Get current user details

Create corresponding DTOs:
- RegisterCompanyRequest (companyName, email, password, firstName, lastName)
- LoginRequest (email, password)
- VerifyOtpRequest (email, otp)
- AuthResponse (token, user, company)
```

### Step 3.3: Implement OTP Service

**Prompt:**
```
Create OTPService.java for email verification:

Features:
- Generate 6-digit OTP codes
- Store OTP in memory cache with 10-minute expiration (use ConcurrentHashMap or Redis)
- Send OTP via email using Spring Mail
- Validate OTP codes
- Rate limiting: max 3 OTP requests per email per hour
- Clean up expired OTPs automatically

Create email templates for:
- Welcome/verification email
- Password reset email
- Order approval notifications
```

---

## 👥 PHASE 4: USER & COMPANY MANAGEMENT (Days 6-7)

### Step 4.1: Implement Company Management

**Prompt:**
```
Create CompanyController.java with these endpoints:

1. GET /api/companies/my-company (authenticated - all roles)
   - Get current user's company details
   - Include: departments, employee count, budget info, subscription details

2. PUT /api/companies/my-company (authenticated - COMPANY_ADMIN only)
   - Update company details
   - Fields: name, address, contact info, logo
   - Cannot change subscription tier (requires super admin)

3. GET /api/companies/my-company/statistics (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER)
   - Total employees
   - Total departments
   - Monthly spend (current vs budget)
   - Active orders count
   - Top spending departments

4. POST /api/companies/my-company/subscription/upgrade (authenticated - COMPANY_ADMIN)
   - Request subscription tier upgrade
   - Creates approval ticket for super admin

5. GET /api/companies (authenticated - SUPER_ADMIN only)
   - List all companies with pagination
   - Filter by: isActive, subscriptionTier, industry
   - Search by name

6. PUT /api/companies/{id}/activate (authenticated - SUPER_ADMIN only)
   - Activate/deactivate company

Create CompanyService.java with business logic.
Create DTOs: CompanyDTO, CompanyStatisticsDTO, UpdateCompanyRequest
```

### Step 4.2: Implement Department Management

**Prompt:**
```
Create DepartmentController.java with these endpoints:

1. GET /api/departments (authenticated - all roles)
   - List departments in current user's company
   - Include: budget info, employee count, current spend

2. POST /api/departments (authenticated - COMPANY_ADMIN only)
   - Create new department
   - Fields: name, code, managerId, monthlyBudget, costCenter

3. PUT /api/departments/{id} (authenticated - COMPANY_ADMIN only)
   - Update department details
   - Can change manager and budget

4. DELETE /api/departments/{id} (authenticated - COMPANY_ADMIN only)
   - Soft delete (set isActive = false)
   - Cannot delete if has employees or active orders

5. GET /api/departments/{id}/budget-status (authenticated - DEPARTMENT_MANAGER, COMPANY_ADMIN)
   - Current budget, spent, remaining
   - Spending trend (last 6 months)
   - Top spending categories

6. POST /api/departments/{id}/adjust-budget (authenticated - COMPANY_ADMIN only)
   - Adjust monthly budget
   - Add budget notes

Create DepartmentService.java with business logic.
Create DTOs: DepartmentDTO, CreateDepartmentRequest, BudgetStatusDTO
```

### Step 4.3: Implement Employee Management

**Prompt:**
```
Create EmployeeController.java with these endpoints:

1. GET /api/employees (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER, DEPARTMENT_MANAGER)
   - List employees in company or department
   - Filter by: departmentId, role, isActive
   - Search by name or email
   - Pagination

2. POST /api/employees (authenticated - COMPANY_ADMIN only)
   - Add new employee to company
   - Send welcome email with temporary password
   - Fields: email, firstName, lastName, phoneNumber, departmentId, role

3. PUT /api/employees/{id} (authenticated - COMPANY_ADMIN only)
   - Update employee details
   - Can change department and role

4. DELETE /api/employees/{id} (authenticated - COMPANY_ADMIN only)
   - Deactivate employee (set isEnabled = false)

5. GET /api/employees/{id}/order-history (authenticated - DEPARTMENT_MANAGER, COMPANY_ADMIN)
   - View employee's order history

6. POST /api/employees/bulk-import (authenticated - COMPANY_ADMIN only)
   - Import employees from CSV file
   - Validate data and send welcome emails

Create EmployeeService.java with business logic.
Create DTOs: EmployeeDTO, CreateEmployeeRequest, BulkImportResult
```

---

## 📦 PHASE 5: PRODUCT CATALOG MANAGEMENT (Days 8-9)

### Step 5.1: Implement Product Management

**Prompt:**
```
Create ProductController.java with these endpoints:

CUSTOMER-FACING (all authenticated users):

1. GET /api/products (public or authenticated)
   - Browse product catalog
   - Filter by: category, subcategory, supplierId, priceRange
   - Search by: name, sku, tags
   - Sort by: price, name, featured
   - Pagination
   - Include stock availability

2. GET /api/products/{id} (public or authenticated)
   - Get product details
   - Include: volumeDiscounts, supplier info, related products
   - Show stock level

3. GET /api/products/categories (public)
   - List all product categories with counts

4. GET /api/products/featured (public)
   - Get featured products

ADMIN-FACING (PROCUREMENT_OFFICER, SUPER_ADMIN):

5. POST /api/products (authenticated - PROCUREMENT_OFFICER, SUPER_ADMIN)
   - Create new product
   - Upload product image
   - Set initial stock level

6. PUT /api/products/{id} (authenticated - PROCUREMENT_OFFICER, SUPER_ADMIN)
   - Update product details

7. DELETE /api/products/{id} (authenticated - SUPER_ADMIN only)
   - Soft delete product (set isActive = false)

8. POST /api/products/bulk-import (authenticated - PROCUREMENT_OFFICER, SUPER_ADMIN)
   - Import products from CSV
   - Validate and map to suppliers

9. PUT /api/products/{id}/stock (authenticated - PROCUREMENT_OFFICER)
   - Update stock level
   - Log inventory change

10. GET /api/products/low-stock (authenticated - PROCUREMENT_OFFICER)
    - Products below reorder level

Create ProductService.java with business logic.
Create DTOs: ProductDTO, CreateProductRequest, BulkImportRequest, StockUpdateRequest
```

### Step 5.2: Implement Supplier Integration

**Prompt:**
```
Create SupplierController.java with these endpoints:

1. GET /api/suppliers (authenticated - PROCUREMENT_OFFICER, COMPANY_ADMIN)
   - List all suppliers
   - Filter by: isActive, rating
   - Include: product count, average delivery time

2. POST /api/suppliers (authenticated - PROCUREMENT_OFFICER only)
   - Add new supplier
   - Send welcome email with portal access

3. PUT /api/suppliers/{id} (authenticated - PROCUREMENT_OFFICER only)
   - Update supplier details

4. GET /api/suppliers/{id}/products (authenticated)
   - List products from specific supplier

5. GET /api/suppliers/{id}/performance (authenticated - PROCUREMENT_OFFICER)
   - Delivery performance metrics
   - Quality ratings
   - Order fulfillment rate

6. POST /api/suppliers/{id}/rate (authenticated - PROCUREMENT_OFFICER)
   - Rate supplier after order delivery
   - Update supplier rating

Create SupplierService.java with business logic.
Create DTOs: SupplierDTO, CreateSupplierRequest, SupplierPerformanceDTO
```

---

## 🛒 PHASE 6: ORDERING & CART SYSTEM (Days 10-12)

### Step 6.1: Implement Shopping Cart

**Prompt:**
```
Create CartController.java with these endpoints:

1. GET /api/cart (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Get current user's cart
   - Include: items, subtotal, taxes, estimated shipping
   - Show volume discounts applied

2. POST /api/cart/items (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Add item to cart
   - Validate: stock availability, minimum order quantity
   - Apply volume discounts automatically

3. PUT /api/cart/items/{itemId} (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Update item quantity
   - Re-calculate discounts

4. DELETE /api/cart/items/{itemId} (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Remove item from cart

5. DELETE /api/cart (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Clear entire cart

6. POST /api/cart/checkout (authenticated - EMPLOYEE, DEPARTMENT_MANAGER)
   - Convert cart to order
   - Validate department budget
   - Create order with PENDING_APPROVAL status
   - Clear cart
   - Trigger approval workflow

Create CartService.java with business logic.
Create in-memory cart storage or database table: cart_items
```

### Step 6.2: Implement Order Management

**Prompt:**
```
Create OrderController.java with these endpoints:

EMPLOYEE ENDPOINTS:

1. GET /api/orders/my-orders (authenticated - EMPLOYEE)
   - List current user's orders
   - Filter by: status, dateRange
   - Pagination

2. GET /api/orders/{id} (authenticated)
   - Get order details
   - Include: items, approval history, tracking info
   - Access control: only own orders (EMPLOYEE) or department orders (MANAGER)

3. POST /api/orders/{id}/cancel (authenticated - EMPLOYEE)
   - Cancel order (only if status = PENDING_APPROVAL)

MANAGER ENDPOINTS:

4. GET /api/orders/pending-approval (authenticated - DEPARTMENT_MANAGER, PROCUREMENT_OFFICER)
   - Orders requiring approval
   - Filter by: department, orderValue
   - Sort by: priority, date

5. POST /api/orders/{id}/approve (authenticated - DEPARTMENT_MANAGER, PROCUREMENT_OFFICER)
   - Approve order
   - Check budget availability
   - Update status to APPROVED
   - Notify employee and procurement

6. POST /api/orders/{id}/reject (authenticated - DEPARTMENT_MANAGER, PROCUREMENT_OFFICER)
   - Reject order with reason
   - Notify employee

PROCUREMENT OFFICER ENDPOINTS:

7. GET /api/orders/all (authenticated - PROCUREMENT_OFFICER, COMPANY_ADMIN)
   - List all company orders
   - Advanced filters: status, department, supplier, dateRange
   - Export to CSV

8. PUT /api/orders/{id}/status (authenticated - PROCUREMENT_OFFICER)
   - Update order status (PROCESSING, SHIPPED, DELIVERED)
   - Add tracking information
   - Set expected/actual delivery dates

9. POST /api/orders/{id}/return (authenticated - PROCUREMENT_OFFICER)
   - Process order return
   - Update budget allocation

10. POST /api/orders/bulk-process (authenticated - PROCUREMENT_OFFICER)
    - Process multiple orders at once
    - Send bulk order to supplier

Create OrderService.java with business logic including:
- Order number generation (format: AO-YYYYMMDD-XXXXX)
- Budget validation
- Approval workflow logic (multi-level for high-value orders)
- Stock reduction on approval
- Email notifications

Create DTOs: OrderDTO, CreateOrderRequest, ApprovalRequest, StatusUpdateRequest
```

### Step 6.3: Implement Approval Workflow Engine

**Prompt:**
```
Create ApprovalWorkflowService.java with the following logic:

APPROVAL RULES:
1. Orders < R5,000: Auto-approved (or department manager approval)
2. Orders R5,000 - R20,000: Department Manager approval
3. Orders R20,000 - R50,000: Procurement Officer approval
4. Orders > R50,000: Multi-level (Manager + Procurement + Company Admin)

FEATURES:
- Determine required approvers based on order value
- Create approval workflow records
- Send notification emails to approvers
- Track approval status
- Handle parallel and sequential approvals
- Escalation logic (if no action within 48 hours)
- Approval delegation (when manager is on leave)

Create ApprovalWorkflowController.java:
1. GET /api/approvals/pending (authenticated - MANAGER, PROCUREMENT_OFFICER)
   - My pending approvals

2. GET /api/approvals/{workflowId} (authenticated)
   - Approval workflow details

3. POST /api/approvals/{workflowId}/delegate (authenticated - MANAGER)
   - Delegate approval to another user
```

---

## 💰 PHASE 7: BUDGET & FINANCE MANAGEMENT (Days 13-14)

### Step 7.1: Implement Budget Management

**Prompt:**
```
Create BudgetController.java with these endpoints:

1. GET /api/budgets/company (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER)
   - Company-wide budget overview
   - Total allocated, spent, remaining
   - Breakdown by department

2. GET /api/budgets/department/{departmentId} (authenticated - DEPARTMENT_MANAGER, COMPANY_ADMIN)
   - Department budget details
   - Monthly spending trend
   - Category breakdown
   - Projected vs actual

3. POST /api/budgets/allocate (authenticated - COMPANY_ADMIN only)
   - Allocate budget to departments for fiscal period
   - Fields: departmentId, fiscalYear, fiscalQuarter, amount, category

4. PUT /api/budgets/{id}/adjust (authenticated - COMPANY_ADMIN only)
   - Adjust budget allocation mid-period
   - Add adjustment notes

5. GET /api/budgets/alerts (authenticated - COMPANY_ADMIN, DEPARTMENT_MANAGER)
   - Budget alerts (over 80%, over 100%)
   - Departments exceeding budget
   - Forecast: will exceed in X days

6. GET /api/budgets/reports/spending-analysis (authenticated - COMPANY_ADMIN)
   - Detailed spending analysis
   - Compare periods
   - Identify trends and anomalies

Create BudgetService.java with business logic:
- Real-time budget tracking
- Spending limit enforcement
- Budget alerts and notifications
- Forecast calculations
- Budget utilization reports
```

### Step 7.2: Implement Payment Tracking

**Prompt:**
```
Create PaymentController.java with these endpoints:

1. GET /api/payments/company (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER)
   - All company payments
   - Filter by: status, method, dateRange
   - Total: pending, paid, overdue

2. GET /api/payments/order/{orderId} (authenticated)
   - Payment details for specific order

3. POST /api/payments/mark-paid (authenticated - PROCUREMENT_OFFICER)
   - Mark order as paid
   - Upload payment proof
   - Fields: orderId, paymentDate, paymentReference, amount

4. POST /api/payments/invoice/{orderId} (authenticated - PROCUREMENT_OFFICER)
   - Generate invoice PDF for order
   - Include: company details, items, taxes, total

5. GET /api/payments/reconciliation (authenticated - COMPANY_ADMIN)
   - Payment reconciliation report
   - Match orders with payments
   - Identify discrepancies

Create PaymentService.java with business logic.
```

---

## 📊 PHASE 8: INVENTORY MANAGEMENT (Days 15-16)

### Step 8.1: Implement Inventory Tracking

**Prompt:**
```
Create InventoryController.java with these endpoints:

1. GET /api/inventory/company (authenticated - PROCUREMENT_OFFICER, COMPANY_ADMIN)
   - Company-wide inventory overview
   - Filter by: department, product, location
   - Show: current stock, reorder needed

2. GET /api/inventory/product/{productId} (authenticated - PROCUREMENT_OFFICER)
   - Inventory levels across all departments
   - Consumption trends
   - Reorder recommendations

3. POST /api/inventory/track (authenticated - PROCUREMENT_OFFICER)
   - Create inventory tracking record for department
   - Fields: productId, departmentId, location, currentStock

4. PUT /api/inventory/{id}/update-stock (authenticated - PROCUREMENT_OFFICER)
   - Update stock levels after restock or consumption

5. GET /api/inventory/reorder-report (authenticated - PROCUREMENT_OFFICER)
   - Products needing reorder
   - Sort by: urgency, projected depletion date

6. POST /api/inventory/auto-reorder/{productId} (authenticated - PROCUREMENT_OFFICER)
   - Enable/disable auto-reorder
   - Set reorder threshold and quantity

7. GET /api/inventory/consumption-forecast (authenticated - PROCUREMENT_OFFICER)
   - Forecast future consumption
   - Based on historical data
   - Recommend optimal stock levels

Create InventoryService.java with business logic:
- Stock level calculations
- Consumption tracking
- Reorder point calculations
- Forecast algorithms
- Automatic reorder creation
```

---

## 📈 PHASE 9: ANALYTICS & REPORTING (Days 17-18)

### Step 9.1: Implement Business Analytics

**Prompt:**
```
Create AnalyticsController.java with these endpoints:

1. GET /api/analytics/dashboard (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER)
   - Executive dashboard metrics
   - Total spend (current month vs last month)
   - Active orders, pending approvals
   - Top spending departments
   - Top purchased products
   - Supplier performance summary

2. GET /api/analytics/spending-trends (authenticated - COMPANY_ADMIN)
   - Monthly spending trends (last 12 months)
   - Category-wise spending
   - Department-wise spending
   - Compare with budget

3. GET /api/analytics/procurement-efficiency (authenticated - PROCUREMENT_OFFICER)
   - Average order processing time
   - Approval turnaround time
   - Supplier delivery performance
   - Order cancellation rate

4. GET /api/analytics/cost-savings (authenticated - COMPANY_ADMIN)
   - Volume discount savings
   - Price trend analysis
   - Identify cost-saving opportunities
   - Compare suppliers

5. GET /api/analytics/employee-insights (authenticated - COMPANY_ADMIN)
   - Ordering patterns by employee
   - Top requesters
   - Average order value by role

6. POST /api/analytics/custom-report (authenticated - COMPANY_ADMIN, PROCUREMENT_OFFICER)
   - Generate custom report
   - Select: metrics, dimensions, filters, date range
   - Export to PDF/Excel

Create AnalyticsService.java with complex aggregation queries.
Use database views or materialized views for performance.
Create DTOs for different analytics responses.
```

### Step 9.2: Implement Export & Reporting

**Prompt:**
```
Create ReportController.java with these endpoints:

1. GET /api/reports/orders/export (authenticated - PROCUREMENT_OFFICER)
   - Export orders to CSV/Excel
   - Filters: dateRange, status, department

2. GET /api/reports/budget/export (authenticated - COMPANY_ADMIN)
   - Export budget report

3. GET /api/reports/inventory/export (authenticated - PROCUREMENT_OFFICER)
   - Export inventory report

4. GET /api/reports/supplier-performance/pdf (authenticated - PROCUREMENT_OFFICER)
   - Generate supplier performance PDF report

5. POST /api/reports/schedule (authenticated - COMPANY_ADMIN)
   - Schedule recurring reports
   - Email reports automatically (weekly/monthly)

Add dependencies for export:
- Apache POI (for Excel)
- iText or Flying Saucer (for PDF)

Create ReportService.java with report generation logic.
```

---

## 💬 PHASE 10: COMMUNICATIONS & NOTIFICATIONS (Days 19-20)

### Step 10.1: Implement Internal Messaging

**Prompt:**
```
Create MessageController.java with these endpoints:

1. GET /api/messages (authenticated)
   - Get user's messages (inbox)
   - Filter by: read/unread, sender
   - Pagination

2. POST /api/messages (authenticated)
   - Send message to user(s)
   - Support: employee-to-manager, procurement-to-employee, etc.
   - Fields: recipientIds, subject, body

3. GET /api/messages/{id} (authenticated)
   - Get message details
   - Mark as read

4. DELETE /api/messages/{id} (authenticated)
   - Delete message

5. GET /api/messages/unread-count (authenticated)
   - Count of unread messages

Create MessageService.java with business logic.
```

### Step 10.2: Implement Notification System

**Prompt:**
```
Create NotificationService.java for system-wide notifications:

NOTIFICATION TYPES:
- ORDER_PLACED: Employee places order
- ORDER_APPROVED: Order approved by manager
- ORDER_REJECTED: Order rejected
- ORDER_SHIPPED: Order shipped
- ORDER_DELIVERED: Order delivered
- BUDGET_ALERT: Department nearing budget limit
- APPROVAL_REQUIRED: Manager needs to approve order
- PAYMENT_REMINDER: Payment due reminder
- STOCK_ALERT: Product low on stock

NOTIFICATION CHANNELS:
- Email (using Spring Mail)
- In-app notifications (stored in database)
- (Optional) SMS for urgent notifications

Create tables:
- notifications (id, userId, type, title, message, isRead, createdAt)
- notification_preferences (userId, notificationType, emailEnabled, inAppEnabled)

Create NotificationController.java:
1. GET /api/notifications (authenticated)
   - Get user's notifications

2. PUT /api/notifications/{id}/read (authenticated)
   - Mark as read

3. PUT /api/notifications/read-all (authenticated)
   - Mark all as read

4. GET /api/notifications/unread-count (authenticated)
   - Count unread notifications

5. PUT /api/notifications/preferences (authenticated)
   - Update notification preferences
```

---

## 🔧 PHASE 11: ADMIN PANEL (Days 21-22)

### Step 11.1: Super Admin Dashboard

**Prompt:**
```
Create SuperAdminController.java with these endpoints:

1. GET /api/admin/dashboard (authenticated - SUPER_ADMIN only)
   - Platform-wide statistics
   - Total companies, users, orders
   - Total revenue (subscription + transaction fees)
   - Active vs inactive companies
   - System health metrics

2. GET /api/admin/companies (authenticated - SUPER_ADMIN only)
   - Manage all companies
   - Filter by: subscriptionTier, status, industry
   - Actions: activate, deactivate, upgrade subscription

3. PUT /api/admin/companies/{id}/subscription (authenticated - SUPER_ADMIN only)
   - Change company subscription tier

4. GET /api/admin/users (authenticated - SUPER_ADMIN only)
   - View all users across all companies
   - Filter by: role, company, status

5. GET /api/admin/system-logs (authenticated - SUPER_ADMIN only)
   - System activity logs
   - Error logs
   - Security events

6. POST /api/admin/maintenance-mode (authenticated - SUPER_ADMIN only)
   - Enable/disable maintenance mode

Create audit logging for all admin actions.
```

---

## 🎨 PHASE 12: FRONTEND IMPLEMENTATION (Days 23-35)

### Step 12.1: Setup Frontend Foundation

**Prompt:**
```
Implement the core frontend structure:

1. **API Configuration** (config/api.js)
   - Base URL: http://localhost:8081/api
   - Axios instance with interceptors
   - Token management (localStorage)
   - Request/response interceptors
   - Error handling

2. **AuthContext** (context/AuthContext.js)
   - Manage authentication state
   - Login, logout, token refresh
   - User and company data
   - Protected route handling

3. **CartContext** (context/CartContext.js)
   - Manage cart state
   - Add, update, remove items
   - Calculate totals
   - Sync with backend

4. **API Service** (services/api.service.js)
   - Wrapper functions for all API endpoints
   - Error handling
   - Loading states

5. **Routing** (App.js)
   - React Router setup
   - Public routes: Landing, Login, Register, VerifyOTP
   - Protected routes: Dashboard, Catalog, Orders, Profile
   - Role-based routing (admin routes, procurement routes)
```

### Step 12.2: Build Authentication Pages

**Prompt:**
```
Create authentication pages:

1. **LandingPage.jsx**
   - Hero section promoting AnyOffice
   - Features: Easy procurement, budget control, supplier management
   - Call-to-action: "Start Your Free Trial"
   - Benefits for different roles
   - Pricing tiers display

2. **RegisterPage.jsx**
   - Company registration form
   - Fields: company name, industry, admin email, password, name, phone
   - Form validation
   - Success message: "Check email for verification"

3. **LoginPage.jsx**
   - Email and password fields
   - Remember me option
   - Forgot password link
   - Error handling (account locked, wrong credentials)

4. **VerifyOtpPage.jsx**
   - 6-digit OTP input
   - Resend OTP button (with countdown)
   - Auto-focus and auto-submit
```

### Step 12.3: Build Main Dashboard

**Prompt:**
```
Create role-specific dashboards:

1. **EmployeeDashboardPage.jsx**
   - Quick order stats (pending, approved, delivered)
   - Recent orders list
   - Order again (from history)
   - Budget remaining (if visible)
   - Featured products carousel

2. **DepartmentManagerDashboard.jsx**
   - Pending approvals widget
   - Department budget status
   - Team orders overview
   - Quick approve/reject actions

3. **ProcurementOfficerDashboard.jsx**
   - Orders needing processing
   - Low stock alerts
   - Supplier performance
   - Approval queue
   - Quick actions: process orders, update tracking

4. **CompanyAdminDashboard.jsx**
   - Company-wide analytics
   - Budget overview (all departments)
   - Employee management shortcuts
   - Recent system activity
   - Subscription status

Use Material-UI components for consistent design.
Add charts using Recharts (bar, line, pie charts).
```

### Step 12.4: Build Product Catalog

**Prompt:**
```
Create catalog and product pages:

1. **CatalogPage.jsx**
   - Product grid with images
   - Category filter sidebar (checkboxes)
   - Search bar
   - Sort options: price (low to high), name (A-Z), popularity
   - Pagination
   - Add to cart buttons
   - Show stock status badges
   - Volume discount indicators

2. **ProductDetailPage.jsx**
   - Product images (gallery)
   - Full description
   - Pricing with volume discounts table
   - Quantity selector
   - Add to cart button
   - Related products section
   - Supplier information
   - Specs and details tabs

Use MUI Grid, Card, Button, TextField components.
Add product image placeholders if no image URL.
```

### Step 12.5: Build Shopping Cart & Checkout

**Prompt:**
```
Create cart and checkout pages:

1. **CartPage.jsx**
   - Cart items list with images
   - Quantity adjustment (+/- buttons)
   - Remove item button
   - Item subtotal calculation
   - Order summary card:
     - Subtotal
     - Volume discounts applied
     - Tax (15%)
     - Shipping estimate
     - Grand total
   - Budget check indicator (red if exceeds, green if OK)
   - Clear cart button
   - Continue shopping button
   - Proceed to checkout button

2. **CheckoutPage.jsx**
   - Review order items
   - Delivery address (auto-fill from company/department)
   - Delivery notes textarea
   - Priority selector (Low, Medium, High, Urgent)
   - Department selector (if multi-department user)
   - Budget confirmation
   - Submit order button
   - Success: redirect to order confirmation page

3. **OrderConfirmationPage.jsx**
   - Order number display
   - Success message
   - Order summary
   - Next steps: awaiting approval
   - Actions: view order, continue shopping
```

### Step 12.6: Build Order Management Pages

**Prompt:**
```
Create order management pages:

1. **OrderHistoryPage.jsx**
   - Orders list (table or cards)
   - Columns: Order #, Date, Items, Total, Status, Actions
   - Filter by status dropdown
   - Date range filter
   - Search by order number
   - Status badges with colors:
     - PENDING_APPROVAL: orange
     - APPROVED: blue
     - PROCESSING: blue
     - SHIPPED: purple
     - DELIVERED: green
     - REJECTED: red
     - CANCELLED: gray
   - Actions: view details, reorder, cancel (if pending)

2. **OrderDetailPage.jsx**
   - Order header: order number, date, status
   - Order items table
   - Approval timeline
   - Delivery information
   - Invoice download button (if available)
   - Cancel button (if status = PENDING_APPROVAL)
   - Track shipment button (if shipped)

3. **ApprovalQueuePage.jsx** (for managers)
   - Pending approvals list
   - Quick view order details in modal
   - Approve/Reject buttons
   - Rejection reason textarea
   - Bulk actions: approve multiple orders
   - Sort by: priority, date, amount
```

### Step 12.7: Build Budget Management Pages

**Prompt:**
```
Create budget management pages:

1. **BudgetDashboardPage.jsx** (Company Admin)
   - Company budget overview card
   - Budget allocation by department (bar chart)
   - Spending trends (line chart - last 12 months)
   - Department budget table:
     - Department, Allocated, Spent, Remaining, % Used
     - Progress bars
     - Alert icons for over-budget
   - Allocate budget button

2. **DepartmentBudgetPage.jsx** (Department Manager)
   - Department name and period
   - Budget status card (circular progress)
   - Category breakdown (pie chart)
   - Monthly spending trend (line chart)
   - Recent transactions table
   - Request additional budget button

3. **BudgetAllocationModal.jsx** (Company Admin)
   - Select department
   - Fiscal year and quarter
   - Amount input
   - Category (optional)
   - Notes textarea
   - Submit button
```

### Step 12.8: Build Employee & Department Management

**Prompt:**
```
Create management pages:

1. **EmployeeManagementPage.jsx** (Company Admin)
   - Employees table with pagination
   - Columns: Name, Email, Department, Role, Status, Actions
   - Filter by: department, role, status
   - Search by name or email
   - Add employee button
   - Actions: edit, deactivate, reset password
   - Bulk import from CSV button

2. **AddEmployeeModal.jsx**
   - Form fields: firstName, lastName, email, phone, department, role
   - Form validation
   - Submit button
   - Success message: "Employee added. Welcome email sent."

3. **DepartmentManagementPage.jsx** (Company Admin)
   - Departments grid/list
   - Department cards showing:
     - Name, Manager, Employee count, Budget status
   - Add department button
   - Edit/Delete actions

4. **AddDepartmentModal.jsx**
   - Name, code, manager selector, monthly budget, cost center
   - Form validation
```

### Step 12.9: Build Supplier & Inventory Pages

**Prompt:**
```
Create supplier and inventory pages:

1. **SupplierManagementPage.jsx** (Procurement Officer)
   - Suppliers table
   - Columns: Name, Contact, Products, Rating, Status, Actions
   - Add supplier button
   - View supplier details and performance

2. **SupplierDetailPage.jsx**
   - Supplier info card
   - Products from supplier
   - Performance metrics (charts)
   - Order history with supplier
   - Rate supplier option

3. **InventoryManagementPage.jsx** (Procurement Officer)
   - Inventory overview
   - Filter by: department, product, location
   - Low stock alerts section
   - Reorder recommendations
   - Update stock button
   - Consumption forecast charts
```

### Step 12.10: Build Analytics & Reports

**Prompt:**
```
Create analytics pages:

1. **AnalyticsDashboardPage.jsx** (Company Admin, Procurement Officer)
   - Key metrics cards:
     - Total spend (this month)
     - Active orders
     - Pending approvals
     - Budget utilization
   - Spending trends chart (line)
   - Top spending departments (bar chart)
   - Top products (table)
   - Supplier performance (bar chart)
   - Recent activity feed

2. **ReportsPage.jsx**
   - Report type selector
   - Filter options: date range, department, etc.
   - Generate report button
   - Export options: PDF, Excel, CSV
   - Scheduled reports section
```

### Step 12.11: Build Profile & Settings

**Prompt:**
```
Create user profile and settings pages:

1. **ProfilePage.jsx**
   - User info card (editable)
   - Company info (read-only for non-admins)
   - Change password section
   - Notification preferences
   - Save changes button

2. **CompanySettingsPage.jsx** (Company Admin)
   - Company details (editable)
   - Logo upload
   - Subscription info
   - Upgrade subscription button
   - Billing history

3. **NotificationPreferencesPage.jsx**
   - Toggle switches for each notification type
   - Email and in-app options
   - Save preferences button
```

### Step 12.12: Build Shared Components

**Prompt:**
```
Create reusable components:

1. **Navbar.jsx**
   - Logo (links to dashboard)
   - Navigation links (role-based)
   - Cart icon with badge (item count)
   - Notifications bell with badge (unread count)
   - User menu dropdown: Profile, Settings, Logout

2. **Footer.jsx**
   - Company info
   - Links: About, Contact, Terms, Privacy
   - Copyright

3. **ProtectedRoute.jsx**
   - Check authentication
   - Check role authorization
   - Redirect to login if not authenticated

4. **BudgetTracker.jsx** (component)
   - Shows budget status bar
   - Colors: green (< 80%), orange (80-100%), red (> 100%)
   - Displays remaining amount

5. **ApprovalQueue.jsx** (widget)
   - Mini list of pending approvals
   - Quick approve/reject
   - View details link

6. **NotificationBell.jsx**
   - Bell icon with badge
   - Dropdown with recent notifications
   - Mark as read action
   - View all link

7. **SearchBar.jsx** (component)
   - Search input with icon
   - Auto-complete suggestions
   - Search products or orders

8. **StatusBadge.jsx**
   - Display status with appropriate color
   - Reusable for orders, employees, etc.

9. **ConfirmDialog.jsx**
   - Reusable confirmation modal
   - For delete, cancel, reject actions

10. **LoadingSpinner.jsx**
    - Full-page or inline loading indicator
```

---

## 🧪 PHASE 13: TESTING (Days 36-38)

### Step 13.1: Backend Testing

**Prompt:**
```
Create comprehensive backend tests:

1. **Unit Tests** (JUnit 5 + Mockito)
   - Test all service methods
   - Mock repository and external dependencies
   - Test business logic: budget validation, approval workflow, stock reduction
   - Test edge cases and error handling

2. **Integration Tests** (Spring Boot Test)
   - Test controller endpoints
   - Use @WebMvcTest for controller tests
   - Use @DataJpaTest for repository tests
   - Test full request/response cycle
   - Test authentication and authorization

3. **Test Coverage**
   - Aim for > 80% code coverage
   - Use JaCoCo for coverage reports

Create test classes:
- AuthControllerTest
- OrderServiceTest
- BudgetServiceTest
- ApprovalWorkflowServiceTest
- InventoryServiceTest
- etc.

Add test dependencies to pom.xml:
- spring-boot-starter-test
- junit-jupiter
- mockito-core
- h2 (in-memory database for tests)
```

### Step 13.2: Frontend Testing

**Prompt:**
```
Create frontend tests:

1. **Component Tests** (React Testing Library)
   - Test all major components
   - Test user interactions
   - Test form validation
   - Test conditional rendering

2. **E2E Tests** (Cypress or Playwright)
   - Test critical user flows:
     - Register company and verify email
     - Login and navigate dashboard
     - Browse catalog and add to cart
     - Checkout and place order
     - Approve order as manager
     - View order history

Create test files:
- LandingPage.test.js
- LoginPage.test.js
- CartPage.test.js
- OrderFlow.cy.js (Cypress)

Add test scripts to package.json:
- npm test (unit tests)
- npm run test:e2e (E2E tests)
```

---

## 🚀 PHASE 14: DEPLOYMENT PREPARATION (Days 39-42)

### Step 14.1: Backend Deployment Setup

**Prompt:**
```
Prepare backend for production deployment:

1. **Environment Configuration**
   - Create application-prod.properties
   - Configure production database (PostgreSQL on cloud)
   - Set production JWT secret (long, random string)
   - Configure email service (SendGrid, AWS SES, or Gmail)
   - Set CORS allowed origins to production frontend URL

2. **Dockerfile for Backend**
   ```dockerfile
   FROM openjdk:17-jdk-slim
   WORKDIR /app
   COPY target/anyoffice-backend-1.0.0.jar app.jar
   EXPOSE 8081
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

3. **Database Migration Strategy**
   - Ensure all Flyway migrations are production-ready
   - Test migrations on staging database
   - Plan for zero-downtime deployments

4. **Security Hardening**
   - Enable HTTPS only
   - Set secure HTTP headers
   - Rate limiting for API endpoints
   - Input validation and sanitization
   - SQL injection prevention (use JPA/Hibernate properly)
   - CSRF protection

5. **Logging & Monitoring**
   - Configure Logback for production logging
   - Log levels: ERROR for production, INFO for staging
   - Integrate with logging service (ELK, Datadog, CloudWatch)
   - Add health check endpoint: GET /actuator/health
   - Add metrics endpoint: GET /actuator/metrics

6. **Build for Production**
   - Run: mvn clean package -DskipTests
   - JAR file will be in target/ directory
```

### Step 14.2: Frontend Deployment Setup

**Prompt:**
```
Prepare frontend for production deployment:

1. **Environment Configuration**
   - Create .env.production
   - Set production API URL
   - Configure analytics (Google Analytics)
   - Set feature flags

2. **Build Optimization**
   - Code splitting
   - Lazy loading for routes
   - Image optimization
   - Minification and compression

3. **Build for Production**
   - Run: npm run build
   - Build will be in build/ directory

4. **Dockerfile for Frontend**
   ```dockerfile
   FROM node:18-alpine AS build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

5. **Nginx Configuration**
   - Serve React app
   - Handle routing (redirect all to index.html)
   - Gzip compression
   - Security headers
```

### Step 14.3: Cloud Deployment

**Prompt:**
```
Deploy to cloud platform (choose one):

OPTION A: AWS
1. **Backend**:
   - Deploy on AWS Elastic Beanstalk or ECS
   - Use RDS for PostgreSQL database
   - Use S3 for file storage (product images)
   - Use CloudFront for CDN

2. **Frontend**:
   - Deploy on AWS S3 + CloudFront
   - Or use AWS Amplify

OPTION B: Azure
1. **Backend**:
   - Deploy on Azure App Service (Java)
   - Use Azure Database for PostgreSQL
   - Use Azure Blob Storage for files

2. **Frontend**:
   - Deploy on Azure Static Web Apps
   - Or Azure App Service

OPTION C: Google Cloud
1. **Backend**:
   - Deploy on Google Cloud Run or App Engine
   - Use Cloud SQL (PostgreSQL)
   - Use Cloud Storage for files

2. **Frontend**:
   - Deploy on Firebase Hosting
   - Or Cloud Run

OPTION D: Heroku (easiest for MVP)
1. **Backend**:
   - Deploy on Heroku (Java buildpack)
   - Use Heroku Postgres add-on
   - Use Cloudinary for image hosting

2. **Frontend**:
   - Deploy on Vercel or Netlify

Setup CI/CD Pipeline:
- Use GitHub Actions
- Automatic deployment on push to main branch
- Run tests before deployment
```

### Step 14.4: Database Setup

**Prompt:**
```
Setup production database:

1. **Provision PostgreSQL Database**
   - Choose cloud provider
   - Create database: anyoffice_db
   - Configure connection pooling
   - Set up automated backups (daily)
   - Enable point-in-time recovery

2. **Initial Data Migration**
   - Run Flyway migrations
   - Seed initial data:
     - Super admin user
     - Sample product categories
     - System configuration

3. **Database Security**
   - Restrict access (whitelist IPs)
   - Use SSL connections
   - Strong password for database user
   - Separate read-only user for analytics/reporting

4. **Monitoring**
   - Set up query performance monitoring
   - Alert on slow queries
   - Monitor connection pool usage
```

---

## 📱 PHASE 15: MOBILE & PWA (Optional - Days 43-50)

**Prompt:**
```
Convert frontend to Progressive Web App (PWA):

1. **Service Worker**
   - Cache static assets for offline access
   - Background sync for cart and orders
   - Push notifications

2. **App Manifest**
   - App name: AnyOffice
   - Icons for different sizes
   - Theme color
   - Display mode: standalone

3. **Mobile Optimization**
   - Responsive design (already done with Material-UI)
   - Touch-friendly buttons
   - Mobile-specific navigation
   - Bottom navigation bar for mobile

4. **Push Notifications**
   - Request permission
   - Subscribe to notifications
   - Handle notification clicks

OR build native mobile apps:

1. **React Native App** (iOS and Android)
   - Share business logic with web
   - Native navigation
   - Biometric authentication
   - Camera for scanning product barcodes
```

---

## 🔄 PHASE 16: INTEGRATION & ADVANCED FEATURES (Days 51-60)

### Step 16.1: Third-Party Integrations

**Prompt:**
```
Integrate with external services:

1. **Payment Gateway** (for online payments)
   - Stripe or PayPal
   - For companies using credit cards instead of PO
   - Secure payment flow

2. **Accounting Software Integration**
   - QuickBooks or Xero API
   - Sync orders and invoices
   - Automate bookkeeping

3. **Shipping Provider Integration**
   - DHL, FedEx, or local courier API
   - Real-time tracking
   - Automatic tracking number updates

4. **Email Service**
   - SendGrid or AWS SES
   - Transactional emails
   - Marketing emails
   - Email templates

5. **SMS Notifications**
   - Twilio or AWS SNS
   - Two-factor authentication
   - Order status updates
```

### Step 16.2: Advanced Features

**Prompt:**
```
Implement advanced features:

1. **AI-Powered Recommendations**
   - Product recommendations based on order history
   - Smart reorder suggestions
   - Predict department needs

2. **RFQ (Request for Quotation) System**
   - Employees can request custom quotes
   - Send RFQ to multiple suppliers
   - Compare quotes and award order

3. **Contract Management**
   - Store supplier contracts
   - Track contract renewal dates
   - Volume commitment tracking

4. **Multi-Location Support**
   - Companies with multiple offices
   - Location-specific inventory
   - Location-based shipping

5. **Custom Approval Workflows**
   - Company admins can define custom workflows
   - Visual workflow builder
   - Conditional approvals

6. **Bulk Ordering**
   - Upload CSV with product SKUs and quantities
   - Bulk order validation
   - Quick checkout

7. **Subscription Orders**
   - Recurring orders (monthly, quarterly)
   - Automatic reorder of frequently used items
   - Subscription management

8. **Price Negotiation**
   - Negotiate prices with suppliers
   - Volume-based pricing tiers
   - Contract pricing
```

---

## ✅ PHASE 17: FINAL TESTING & LAUNCH (Days 61-65)

### Step 17.1: Comprehensive Testing

**Prompt:**
```
Final testing checklist:

1. **Functional Testing**
   - Test all user flows end-to-end
   - Test with different roles
   - Test edge cases
   - Test error scenarios

2. **Performance Testing**
   - Load testing (Apache JMeter or k6)
   - Test with 1000+ concurrent users
   - Database query optimization
   - API response time < 500ms

3. **Security Testing**
   - Penetration testing
   - SQL injection prevention
   - XSS prevention
   - CSRF protection
   - Authentication/authorization testing

4. **Usability Testing**
   - Test with real users
   - Gather feedback
   - Improve UX based on feedback

5. **Browser Compatibility**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile browsers

6. **Accessibility Testing**
   - WCAG compliance
   - Screen reader compatibility
   - Keyboard navigation
```

### Step 17.2: Documentation

**Prompt:**
```
Create comprehensive documentation:

1. **User Documentation**
   - User guide for employees
   - Admin guide for company admins
   - Procurement officer guide
   - FAQ section

2. **API Documentation**
   - Use Swagger/OpenAPI
   - Document all endpoints
   - Include examples
   - Auto-generate from code

3. **Developer Documentation**
   - System architecture
   - Database schema
   - Deployment guide
   - Contributing guide

4. **Video Tutorials**
   - Getting started video
   - How to place an order
   - How to approve orders
   - How to manage budgets
```

### Step 17.3: Launch Preparation

**Prompt:**
```
Pre-launch checklist:

1. **Infrastructure**
   - ✅ Production servers ready
   - ✅ Database configured and backed up
   - ✅ SSL certificates installed
   - ✅ CDN configured
   - ✅ Monitoring tools active
   - ✅ Error tracking (Sentry)

2. **Application**
   - ✅ All features tested
   - ✅ No critical bugs
   - ✅ Performance optimized
   - ✅ Security hardened

3. **Legal & Compliance**
   - ✅ Terms of Service
   - ✅ Privacy Policy
   - ✅ Data protection compliance (GDPR, POPIA)
   - ✅ Cookie policy

4. **Marketing**
   - ✅ Landing page ready
   - ✅ Email templates ready
   - ✅ Social media accounts created
   - ✅ Press release prepared

5. **Support**
   - ✅ Support email/ticket system
   - ✅ Live chat integration
   - ✅ Support team trained
```

### Step 17.4: Soft Launch

**Prompt:**
```
Soft launch strategy:

1. **Beta Testing**
   - Invite 5-10 friendly companies
   - Collect detailed feedback
   - Fix critical issues
   - Monitor system performance

2. **Gradual Rollout**
   - Week 1: 10 companies
   - Week 2: 50 companies
   - Week 3: 100 companies
   - Month 2: Open to public

3. **Monitoring**
   - Watch error rates
   - Monitor server load
   - Track user behavior
   - Collect feedback continuously

4. **Iteration**
   - Release weekly updates
   - Fix bugs quickly
   - Add small improvements
   - Build based on user feedback
```

---

## 📈 PHASE 18: POST-LAUNCH (Ongoing)

### Growth & Scaling

**Prompt:**
```
Post-launch roadmap:

MONTH 1-3:
- Fix bugs and stability issues
- Improve performance
- Add missing features from user feedback
- Improve onboarding flow

MONTH 4-6:
- Advanced analytics and reporting
- Mobile app development
- API for third-party integrations
- Multi-language support

MONTH 7-12:
- AI-powered features
- Marketplace for suppliers
- Credit and financing options
- Global expansion

SCALING:
- Auto-scaling infrastructure
- Read replicas for database
- Caching layer (Redis)
- Microservices architecture (if needed)
- Queue system for background jobs (RabbitMQ, AWS SQS)
```

---

## 📋 COMPLETE FEATURE CHECKLIST

### Core Features ✅
- [ ] User Authentication & Authorization
- [ ] Company & Department Management
- [ ] Employee Management
- [ ] Product Catalog
- [ ] Shopping Cart
- [ ] Order Placement
- [ ] Approval Workflows
- [ ] Budget Management & Tracking
- [ ] Inventory Management
- [ ] Supplier Management
- [ ] Payment Tracking
- [ ] Analytics & Reporting
- [ ] Internal Messaging
- [ ] Notifications (Email + In-app)
- [ ] User Profiles & Settings

### Admin Features ✅
- [ ] Super Admin Dashboard
- [ ] Company Management (CRUD)
- [ ] Subscription Management
- [ ] System Monitoring
- [ ] Audit Logs

### Advanced Features ⏳
- [ ] AI Recommendations
- [ ] RFQ System
- [ ] Contract Management
- [ ] Multi-location Support
- [ ] Custom Approval Workflows
- [ ] Bulk Ordering
- [ ] Subscription Orders
- [ ] Mobile App (PWA or Native)

---

## 🛠️ TECHNOLOGY STACK SUMMARY

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17
- **Database:** PostgreSQL
- **ORM:** JPA/Hibernate
- **Security:** Spring Security + JWT
- **Migration:** Flyway
- **Email:** Spring Mail
- **Build:** Maven

### Frontend
- **Framework:** React 18
- **UI Library:** Material-UI (MUI)
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Charts:** Recharts
- **State:** Context API + Hooks

### DevOps
- **Containerization:** Docker
- **CI/CD:** GitHub Actions
- **Cloud:** AWS/Azure/GCP/Heroku
- **Monitoring:** CloudWatch/Datadog/New Relic
- **Error Tracking:** Sentry

---

## 📊 DATABASE SCHEMA SUMMARY

**10 Core Tables:**
1. `companies` - Company information
2. `departments` - Department structure
3. `users` - All users (employees, admins, managers)
4. `suppliers` - Supplier information
5. `office_products` - Product catalog
6. `orders` - All orders
7. `order_items` - Order line items
8. `approval_workflows` - Approval tracking
9. `budget_allocations` - Budget management
10. `inventory_tracking` - Inventory records

**Supporting Tables:**
- `messages` - Internal messaging
- `notifications` - System notifications
- `notification_preferences` - User preferences
- `cart_items` - Shopping cart (temporary)
- `audit_logs` - System audit trail

---

## 🎯 SUCCESS METRICS

### Business Metrics
- Number of registered companies
- Monthly active users
- Orders per month
- Average order value
- Customer retention rate
- Revenue (subscriptions + transaction fees)

### Technical Metrics
- API response time < 500ms
- Uptime > 99.9%
- Error rate < 0.1%
- Page load time < 3 seconds

### User Satisfaction
- Net Promoter Score (NPS) > 50
- User satisfaction score > 4/5
- Support ticket resolution time < 24 hours

---

## 💰 MONETIZATION STRATEGY

### Subscription Tiers
1. **Basic** (Free for first 3 months, then R999/month)
   - Up to 20 employees
   - 500 orders/month
   - Basic analytics
   - Email support

2. **Professional** (R2,999/month)
   - Up to 100 employees
   - Unlimited orders
   - Advanced analytics
   - Priority support
   - Custom approval workflows

3. **Enterprise** (Custom pricing)
   - Unlimited employees
   - Unlimited orders
   - Dedicated account manager
   - Custom integrations
   - SLA guarantee
   - On-premise deployment option

### Additional Revenue
- Transaction fees (optional: 1-2% per order)
- Premium features (AI recommendations, advanced reporting)
- Supplier listing fees
- White-label solution for large enterprises

---

## 🚀 GO-TO-MARKET STRATEGY

### Target Market
- **Primary:** Small to medium businesses (10-100 employees)
- **Secondary:** Large enterprises (100+ employees)
- **Industries:** Professional services, tech startups, retail, manufacturing

### Marketing Channels
1. **Digital Marketing**
   - Google Ads (target: "office supplies procurement", "B2B office supplies")
   - LinkedIn advertising
   - Content marketing (blog posts, case studies)
   - SEO optimization

2. **Partnerships**
   - Partner with office suppliers
   - Partner with accounting software companies
   - Reseller partnerships

3. **Sales**
   - Direct sales team for enterprise
   - Self-service for SMBs
   - Free trial (30 days)
   - Referral program

---

## ✨ COMPETITIVE ADVANTAGES

1. **Budget Control:** Real-time budget tracking prevents overspending
2. **Approval Workflows:** Automated multi-level approvals save time
3. **Analytics:** Data-driven insights for cost optimization
4. **Supplier Integration:** Access to multiple suppliers in one platform
5. **Inventory Tracking:** Predict needs and automate reordering
6. **Easy to Use:** Modern, intuitive interface
7. **Scalable:** Grows with your business

---

## 📞 SUPPORT & MAINTENANCE

### Customer Support
- Email support: support@anyoffice.thestationeryhub.com
- Live chat (business hours)
- Help center with articles and videos
- Ticket system for issue tracking

### Maintenance Schedule
- Weekly updates (bug fixes, minor improvements)
- Monthly feature releases
- Quarterly major updates
- Annual penetration testing and security audits

---

## 🎓 TRAINING MATERIALS

### For Companies
1. **Onboarding Guide** - Getting started with AnyOffice
2. **Admin Training** - For company administrators
3. **Employee Training** - How to place orders
4. **Manager Training** - Approving orders and managing budgets

### Formats
- Video tutorials
- PDF guides
- Interactive walkthroughs
- Webinars (monthly)
- In-person training (Enterprise tier)

---

## END OF ROADMAP

**Total Development Time:** 60-65 days with a full-stack developer
**Recommended Team:**
- 1 Backend Developer
- 1 Frontend Developer
- 1 UI/UX Designer
- 1 QA Tester
- 1 DevOps Engineer
- 1 Product Manager

**Timeline can be reduced to 45 days with a team of 4-5 developers working in parallel.**

---

## 🎯 NEXT STEPS

1. Review this roadmap
2. Adjust based on priorities and resources
3. Set up project management tool (Jira, Trello, Linear)
4. Create initial project structure (Phase 1)
5. Start building! 🚀

**Good luck building AnyOffice!** 🏢✨
