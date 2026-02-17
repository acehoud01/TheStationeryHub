# AnyOffice - Quick Start Prompts 🚀

**Copy-paste these prompts sequentially to build AnyOffice**

---

## 🏗️ WEEK 1: FOUNDATION (Days 1-7)

### Day 1: Project Setup

```
Create a new Spring Boot project for AnyOffice backend:
- Group ID: com.anyoffice, Artifact: anyoffice-backend
- Spring Boot 3.2.0, Java 17
- Dependencies: Web, JPA, Security, Validation, Mail, PostgreSQL, JWT (0.12.6)
- Directory structure: config/, controller/, dto/, exception/, model/, repository/, security/, service/
- application.properties: Server port 8081, PostgreSQL (anyoffice_db), JWT config, CORS
```

```
Create React frontend for AnyOffice:
- Name: anyoffice-frontend
- Dependencies: React 18, React Router 6, MUI 5, Axios, Recharts
- Folders: components/, config/, context/, pages/, services/, styles/, utils/
- API base URL: http://localhost:8081/api
```

### Days 2-3: Core Models

```
Create these entity models in com.anyoffice.model package:

1. User.java - id, email, password, firstName, lastName, phoneNumber, role (SUPER_ADMIN, COMPANY_ADMIN, PROCUREMENT_OFFICER, DEPARTMENT_MANAGER, EMPLOYEE), companyId, departmentId, isEnabled, isEmailVerified, accountLocked, failedLoginAttempts, lockoutEndTime, timestamps

2. Company.java - id, name, registrationNumber, taxNumber, industry, numberOfEmployees, full address, contactEmail, contactPhone, logoUrl, isActive, subscriptionTier (BASIC, PROFESSIONAL, ENTERPRISE), subscriptionStartDate, subscriptionEndDate, monthlyBudget, timestamps, @OneToMany departments and users

3. Department.java - id, name, code, @ManyToOne company, managerId, monthlyBudget, currentSpend, costCenter, isActive, timestamps, @OneToMany employees

4. OfficeProduct.java - id, name, sku, category (WRITING, PAPER, FILING, TECHNOLOGY, FURNITURE, CLEANING, BREAKROOM, SAFETY, MISC), subcategory, description, unitPrice, currency, unit, quantityPerUnit, supplierId, stockLevel, reorderLevel, minimumOrderQuantity, volumeDiscounts (JSON), imageUrl, isActive, isFeatured, tags, timestamps

5. Order.java - id, orderNumber, @ManyToOne user/company/department, status (PENDING_APPROVAL, APPROVED, REJECTED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED), orderDate, approvedBy, approvedAt, rejectionReason, amounts (total, tax, shipping, grand total), shippingAddress, deliveryNotes, expectedDeliveryDate, actualDeliveryDate, purchaseOrderNumber, invoiceNumber, paymentStatus (PENDING, PAID, PARTIALLY_PAID), paymentMethod, priority, timestamps, @OneToMany orderItems

6. OrderItem.java - id, @ManyToOne order, @ManyToOne product, quantity, unitPrice, discount, subtotal, notes

7. Supplier.java - id, name, registrationNumber, email, phone, address, contactPerson*, paymentTerms, deliveryLeadTime, minimumOrderValue, rating, isActive, timestamps, @OneToMany products

8. ApprovalWorkflow.java - id, @ManyToOne order/requester/approver, level, status (PENDING, APPROVED, REJECTED), comments, approvedAt, createdAt

9. BudgetAllocation.java - id, @ManyToOne company/department, fiscalYear, fiscalQuarter, allocatedAmount, spentAmount, remainingAmount, category, timestamps

10. InventoryTracking.java - id, @ManyToOne product/company/department, currentStock, location, lastRestockedDate, lastRestockedQuantity, averageMonthlyConsumption, projectedDepletionDate, autoReorderEnabled, updatedAt

Use proper JPA annotations, indexes, and constraints.
```

```
Create Flyway migration V1__init_schema.sql that creates all 10 tables with proper foreign keys, constraints, indexes, and sequences for auto-generated fields.
```

### Days 4-5: Authentication & Security

```
Create Spring Security configuration for AnyOffice:

1. SecurityConfig.java - JWT authentication, CORS (allow localhost:3001), BCryptPasswordEncoder, public endpoints (/api/auth/**, /api/public/**), protect others, enable @PreAuthorize

2. JwtTokenProvider.java - Generate JWT (24h expiration), validate tokens, extract username and authorities, secret from application.properties

3. JwtAuthenticationFilter.java - Intercept requests, validate JWT, set SecurityContext

4. CustomUserDetailsService.java - Load user by email, convert to UserDetails

5. Define role-based access control for all 5 roles
```

```
Create AuthController.java with these endpoints:
- POST /api/auth/register (public) - Register company with admin, create company + department + admin user, send OTP
- POST /api/auth/verify-otp (public) - Verify OTP, set isEmailVerified=true, return JWT
- POST /api/auth/login (public) - Authenticate, check locks, track failed attempts (max 5, lock 30 min), return JWT
- POST /api/auth/forgot-password (public) - Send reset OTP
- POST /api/auth/reset-password (public) - Reset with OTP
- POST /api/auth/resend-otp (public) - Resend OTP
- GET /api/auth/me (authenticated) - Get current user

Create DTOs: RegisterCompanyRequest, LoginRequest, VerifyOtpRequest, AuthResponse
```

```
Create OTPService.java:
- Generate 6-digit OTP
- Store in ConcurrentHashMap with 10-min expiration
- Send via Spring Mail
- Validate OTP
- Rate limit: max 3 requests per email per hour
- Email templates for verification, password reset, and order approvals
```

### Days 6-7: User & Company Management

```
Create CompanyController.java:
- GET /api/companies/my-company (all roles) - Get current company with departments, employee count, budget, subscription
- PUT /api/companies/my-company (COMPANY_ADMIN) - Update details (name, address, contact, logo)
- GET /api/companies/my-company/statistics (COMPANY_ADMIN, PROCUREMENT_OFFICER) - Total employees, departments, monthly spend, active orders, top spending departments
- POST /api/companies/my-company/subscription/upgrade (COMPANY_ADMIN) - Request upgrade
- GET /api/companies (SUPER_ADMIN) - List all with pagination, filter by isActive/tier/industry
- PUT /api/companies/{id}/activate (SUPER_ADMIN) - Activate/deactivate

Create CompanyService.java and DTOs: CompanyDTO, CompanyStatisticsDTO, UpdateCompanyRequest
```

```
Create DepartmentController.java:
- GET /api/departments (all) - List company departments with budget info, employee count, current spend
- POST /api/departments (COMPANY_ADMIN) - Create department (name, code, managerId, monthlyBudget, costCenter)
- PUT /api/departments/{id} (COMPANY_ADMIN) - Update details
- DELETE /api/departments/{id} (COMPANY_ADMIN) - Soft delete (check no employees or active orders)
- GET /api/departments/{id}/budget-status (DEPARTMENT_MANAGER, COMPANY_ADMIN) - Budget, spent, remaining, trend, top categories
- POST /api/departments/{id}/adjust-budget (COMPANY_ADMIN) - Adjust budget with notes

Create DepartmentService.java and DTOs: DepartmentDTO, CreateDepartmentRequest, BudgetStatusDTO
```

```
Create EmployeeController.java:
- GET /api/employees (COMPANY_ADMIN, PROCUREMENT_OFFICER, DEPARTMENT_MANAGER) - List with filters (departmentId, role, isActive), search, pagination
- POST /api/employees (COMPANY_ADMIN) - Add employee, send welcome email with temp password
- PUT /api/employees/{id} (COMPANY_ADMIN) - Update details, change department/role
- DELETE /api/employees/{id} (COMPANY_ADMIN) - Deactivate (set isEnabled=false)
- GET /api/employees/{id}/order-history (DEPARTMENT_MANAGER, COMPANY_ADMIN) - View orders
- POST /api/employees/bulk-import (COMPANY_ADMIN) - Import from CSV, validate, send emails

Create EmployeeService.java and DTOs: EmployeeDTO, CreateEmployeeRequest, BulkImportResult
```

---

## 🛍️ WEEK 2: PRODUCTS & ORDERING (Days 8-14)

### Days 8-9: Product Catalog

```
Create ProductController.java:

CUSTOMER ENDPOINTS (all authenticated):
- GET /api/products - Browse catalog, filter (category, subcategory, supplier, priceRange), search (name, sku, tags), sort (price, name, featured), pagination, show stock
- GET /api/products/{id} - Details with volumeDiscounts, supplier info, related products, stock level
- GET /api/products/categories - List categories with counts
- GET /api/products/featured - Featured products

ADMIN ENDPOINTS (PROCUREMENT_OFFICER, SUPER_ADMIN):
- POST /api/products - Create with image upload, set initial stock
- PUT /api/products/{id} - Update details
- DELETE /api/products/{id} (SUPER_ADMIN) - Soft delete
- POST /api/products/bulk-import - Import from CSV with supplier mapping
- PUT /api/products/{id}/stock - Update stock, log change
- GET /api/products/low-stock - Products below reorder level

Create ProductService.java and DTOs: ProductDTO, CreateProductRequest, BulkImportRequest, StockUpdateRequest
```

```
Create SupplierController.java:
- GET /api/suppliers (PROCUREMENT_OFFICER, COMPANY_ADMIN) - List with filter (isActive, rating), include product count, delivery time
- POST /api/suppliers (PROCUREMENT_OFFICER) - Add supplier, send welcome email
- PUT /api/suppliers/{id} (PROCUREMENT_OFFICER) - Update details
- GET /api/suppliers/{id}/products (authenticated) - List products
- GET /api/suppliers/{id}/performance (PROCUREMENT_OFFICER) - Delivery metrics, quality ratings, fulfillment rate
- POST /api/suppliers/{id}/rate (PROCUREMENT_OFFICER) - Rate supplier, update rating

Create SupplierService.java and DTOs: SupplierDTO, CreateSupplierRequest, SupplierPerformanceDTO
```

### Days 10-12: Shopping Cart & Orders

```
Create CartController.java:
- GET /api/cart (EMPLOYEE, DEPARTMENT_MANAGER) - Get cart with items, subtotal, taxes, shipping, volume discounts
- POST /api/cart/items (EMPLOYEE, DEPARTMENT_MANAGER) - Add item, validate stock and minimum order, apply volume discounts
- PUT /api/cart/items/{itemId} (EMPLOYEE, DEPARTMENT_MANAGER) - Update quantity, recalculate discounts
- DELETE /api/cart/items/{itemId} (EMPLOYEE, DEPARTMENT_MANAGER) - Remove item
- DELETE /api/cart (EMPLOYEE, DEPARTMENT_MANAGER) - Clear cart
- POST /api/cart/checkout (EMPLOYEE, DEPARTMENT_MANAGER) - Create order with PENDING_APPROVAL, validate budget, clear cart, trigger approval workflow

Create CartService.java with in-memory or database cart storage
```

```
Create OrderController.java:

EMPLOYEE:
- GET /api/orders/my-orders (EMPLOYEE) - List own orders, filter by status/dateRange, pagination
- GET /api/orders/{id} (authenticated) - Order details with items, approval history, tracking (access control: own orders or department orders)
- POST /api/orders/{id}/cancel (EMPLOYEE) - Cancel if PENDING_APPROVAL

MANAGER:
- GET /api/orders/pending-approval (DEPARTMENT_MANAGER, PROCUREMENT_OFFICER) - Orders needing approval, filter by department/value, sort by priority/date
- POST /api/orders/{id}/approve (DEPARTMENT_MANAGER, PROCUREMENT_OFFICER) - Approve, check budget, update status to APPROVED, notify employee and procurement
- POST /api/orders/{id}/reject (DEPARTMENT_MANAGER, PROCUREMENT_OFFICER) - Reject with reason, notify employee

PROCUREMENT:
- GET /api/orders/all (PROCUREMENT_OFFICER, COMPANY_ADMIN) - All company orders, advanced filters, export to CSV
- PUT /api/orders/{id}/status (PROCUREMENT_OFFICER) - Update status (PROCESSING, SHIPPED, DELIVERED), add tracking, set delivery dates
- POST /api/orders/{id}/return (PROCUREMENT_OFFICER) - Process return, update budget
- POST /api/orders/bulk-process (PROCUREMENT_OFFICER) - Process multiple orders, send bulk to supplier

Create OrderService.java:
- Order number generation (AO-YYYYMMDD-XXXXX)
- Budget validation
- Approval workflow logic (multi-level for high-value)
- Stock reduction on approval
- Email notifications

Create DTOs: OrderDTO, CreateOrderRequest, ApprovalRequest, StatusUpdateRequest
```

```
Create ApprovalWorkflowService.java with approval logic:

RULES:
- < R5,000: Auto-approved or department manager
- R5,000 - R20,000: Department Manager
- R20,000 - R50,000: Procurement Officer
- > R50,000: Multi-level (Manager + Procurement + Company Admin)

FEATURES:
- Determine approvers based on order value
- Create workflow records
- Send notification emails
- Track approval status
- Parallel and sequential approvals
- Escalation (if no action within 48h)
- Delegation when manager on leave

Create ApprovalWorkflowController.java:
- GET /api/approvals/pending (MANAGER, PROCUREMENT_OFFICER) - My pending approvals
- GET /api/approvals/{workflowId} (authenticated) - Workflow details
- POST /api/approvals/{workflowId}/delegate (MANAGER) - Delegate to another user
```

### Days 13-14: Budget & Finance

```
Create BudgetController.java:
- GET /api/budgets/company (COMPANY_ADMIN, PROCUREMENT_OFFICER) - Company budget overview, total allocated/spent/remaining, breakdown by department
- GET /api/budgets/department/{departmentId} (DEPARTMENT_MANAGER, COMPANY_ADMIN) - Department budget, monthly trend, category breakdown, projected vs actual
- POST /api/budgets/allocate (COMPANY_ADMIN) - Allocate to departments for fiscal period (departmentId, fiscalYear, fiscalQuarter, amount, category)
- PUT /api/budgets/{id}/adjust (COMPANY_ADMIN) - Adjust mid-period with notes
- GET /api/budgets/alerts (COMPANY_ADMIN, DEPARTMENT_MANAGER) - Budget alerts (over 80%, over 100%), departments exceeding, forecast
- GET /api/budgets/reports/spending-analysis (COMPANY_ADMIN) - Detailed analysis, compare periods, identify trends

Create BudgetService.java:
- Real-time tracking
- Spending limit enforcement
- Alerts and notifications
- Forecast calculations
- Utilization reports
```

```
Create PaymentController.java:
- GET /api/payments/company (COMPANY_ADMIN, PROCUREMENT_OFFICER) - All payments, filter by status/method/date, totals (pending, paid, overdue)
- GET /api/payments/order/{orderId} (authenticated) - Payment details for order
- POST /api/payments/mark-paid (PROCUREMENT_OFFICER) - Mark paid, upload proof (orderId, date, reference, amount)
- POST /api/payments/invoice/{orderId} (PROCUREMENT_OFFICER) - Generate invoice PDF (company details, items, taxes, total)
- GET /api/payments/reconciliation (COMPANY_ADMIN) - Reconciliation report, match orders with payments, identify discrepancies

Create PaymentService.java
```

---

## 📦 WEEK 3: INVENTORY & ANALYTICS (Days 15-21)

### Days 15-16: Inventory Management

```
Create InventoryController.java:
- GET /api/inventory/company (PROCUREMENT_OFFICER, COMPANY_ADMIN) - Company-wide inventory, filter (department, product, location), show current stock, reorder needed
- GET /api/inventory/product/{productId} (PROCUREMENT_OFFICER) - Levels across departments, consumption trends, reorder recommendations
- POST /api/inventory/track (PROCUREMENT_OFFICER) - Create tracking record (productId, departmentId, location, currentStock)
- PUT /api/inventory/{id}/update-stock (PROCUREMENT_OFFICER) - Update after restock or consumption
- GET /api/inventory/reorder-report (PROCUREMENT_OFFICER) - Products needing reorder, sort by urgency/projected depletion
- POST /api/inventory/auto-reorder/{productId} (PROCUREMENT_OFFICER) - Enable/disable auto-reorder, set threshold and quantity
- GET /api/inventory/consumption-forecast (PROCUREMENT_OFFICER) - Forecast future consumption based on history, recommend optimal stock

Create InventoryService.java:
- Stock calculations
- Consumption tracking
- Reorder point calculations
- Forecast algorithms
- Automatic reorder creation
```

### Days 17-18: Analytics & Reporting

```
Create AnalyticsController.java:
- GET /api/analytics/dashboard (COMPANY_ADMIN, PROCUREMENT_OFFICER) - Executive metrics: total spend (current vs last month), active orders, pending approvals, top spending departments, top products, supplier performance summary
- GET /api/analytics/spending-trends (COMPANY_ADMIN) - Monthly trends (last 12 months), category-wise, department-wise, compare with budget
- GET /api/analytics/procurement-efficiency (PROCUREMENT_OFFICER) - Average order processing time, approval turnaround, supplier delivery performance, cancellation rate
- GET /api/analytics/cost-savings (COMPANY_ADMIN) - Volume discount savings, price trends, cost-saving opportunities, compare suppliers
- GET /api/analytics/employee-insights (COMPANY_ADMIN) - Ordering patterns by employee, top requesters, average order value by role
- POST /api/analytics/custom-report (COMPANY_ADMIN, PROCUREMENT_OFFICER) - Generate custom report, select metrics/dimensions/filters/dateRange, export to PDF/Excel

Create AnalyticsService.java with complex aggregation queries. Use database views for performance.
```

```
Create ReportController.java:
- GET /api/reports/orders/export (PROCUREMENT_OFFICER) - Export to CSV/Excel with filters (dateRange, status, department)
- GET /api/reports/budget/export (COMPANY_ADMIN) - Export budget report
- GET /api/reports/inventory/export (PROCUREMENT_OFFICER) - Export inventory report
- GET /api/reports/supplier-performance/pdf (PROCUREMENT_OFFICER) - Generate PDF report
- POST /api/reports/schedule (COMPANY_ADMIN) - Schedule recurring reports (weekly/monthly) via email

Add dependencies: Apache POI (Excel), iText or Flying Saucer (PDF)

Create ReportService.java
```

### Days 19-20: Communications

```
Create MessageController.java:
- GET /api/messages (authenticated) - Get inbox, filter by read/unread/sender, pagination
- POST /api/messages (authenticated) - Send message to user(s), support employee-to-manager, procurement-to-employee (recipientIds, subject, body)
- GET /api/messages/{id} (authenticated) - Message details, mark as read
- DELETE /api/messages/{id} (authenticated) - Delete message
- GET /api/messages/unread-count (authenticated) - Count unread

Create MessageService.java
```

```
Create NotificationService.java:

NOTIFICATION TYPES: ORDER_PLACED, ORDER_APPROVED, ORDER_REJECTED, ORDER_SHIPPED, ORDER_DELIVERED, BUDGET_ALERT, APPROVAL_REQUIRED, PAYMENT_REMINDER, STOCK_ALERT

CHANNELS: Email (Spring Mail), In-app (database), Optional SMS (urgent)

Create tables:
- notifications (id, userId, type, title, message, isRead, createdAt)
- notification_preferences (userId, notificationType, emailEnabled, inAppEnabled)

Create NotificationController.java:
- GET /api/notifications (authenticated) - Get user's notifications
- PUT /api/notifications/{id}/read (authenticated) - Mark as read
- PUT /api/notifications/read-all (authenticated) - Mark all as read
- GET /api/notifications/unread-count (authenticated) - Count unread
- PUT /api/notifications/preferences (authenticated) - Update preferences
```

### Days 21-22: Admin Panel

```
Create SuperAdminController.java (SUPER_ADMIN only):
- GET /api/admin/dashboard - Platform-wide stats: total companies/users/orders, revenue (subscriptions + fees), active vs inactive companies, system health
- GET /api/admin/companies - Manage all companies, filter (tier, status, industry), actions (activate, deactivate, upgrade)
- PUT /api/admin/companies/{id}/subscription - Change subscription tier
- GET /api/admin/users - View all users across companies, filter (role, company, status)
- GET /api/admin/system-logs - Activity logs, error logs, security events
- POST /api/admin/maintenance-mode - Enable/disable maintenance

Create audit logging for all admin actions
```

---

## 💻 WEEK 4-5: FRONTEND (Days 23-35)

### Days 23-24: Frontend Foundation

```
Implement core frontend structure:

1. API Configuration (config/api.js) - Axios instance with base URL http://localhost:8081/api, interceptors for token management (localStorage), request/response interceptors, error handling

2. AuthContext (context/AuthContext.js) - Manage auth state, login/logout, token refresh, user and company data, protected route handling

3. CartContext (context/CartContext.js) - Manage cart state, add/update/remove items, calculate totals, sync with backend

4. API Service (services/api.service.js) - Wrapper functions for all API endpoints, error handling, loading states

5. Routing (App.js) - React Router setup, public routes (Landing, Login, Register, VerifyOTP), protected routes (Dashboard, Catalog, Orders, Profile), role-based routing
```

### Days 25-26: Authentication Pages

```
Create authentication pages with Material-UI:

1. LandingPage.jsx - Hero promoting AnyOffice, features (easy procurement, budget control, supplier management), CTA "Start Your Free Trial", benefits for different roles, pricing tiers

2. RegisterPage.jsx - Company registration form (company name, industry, admin email, password, name, phone), form validation, success message "Check email for verification"

3. LoginPage.jsx - Email and password fields, remember me, forgot password link, error handling (locked, wrong credentials)

4. VerifyOtpPage.jsx - 6-digit OTP input, resend OTP button with countdown, auto-focus and auto-submit
```

### Days 27-28: Dashboards

```
Create role-specific dashboards using MUI and Recharts:

1. EmployeeDashboardPage.jsx - Quick order stats (pending, approved, delivered), recent orders list, order again from history, budget remaining (if visible), featured products carousel

2. DepartmentManagerDashboard.jsx - Pending approvals widget, department budget status, team orders overview, quick approve/reject actions

3. ProcurementOfficerDashboard.jsx - Orders needing processing, low stock alerts, supplier performance, approval queue, quick actions (process orders, update tracking)

4. CompanyAdminDashboard.jsx - Company-wide analytics, budget overview (all departments), employee management shortcuts, recent system activity, subscription status

Use MUI components and Recharts for bar/line/pie charts
```

### Days 29-30: Product Catalog

```
Create catalog and product pages:

1. CatalogPage.jsx - Product grid with images, category filter sidebar (checkboxes), search bar, sort options (price low-to-high, name A-Z, popularity), pagination, add to cart buttons, show stock status badges, volume discount indicators

2. ProductDetailPage.jsx - Product image gallery, full description, pricing with volume discounts table, quantity selector, add to cart button, related products section, supplier info, specs and details tabs

Use MUI Grid, Card, Button, TextField. Add image placeholders if no URL.
```

### Days 31-32: Cart & Checkout

```
Create cart and checkout pages:

1. CartPage.jsx - Items list with images, quantity adjustment (+/- buttons), remove item button, item subtotal, order summary card (subtotal, volume discounts, tax 15%, shipping estimate, grand total), budget check indicator (red if exceeds, green if OK), clear cart, continue shopping, proceed to checkout

2. CheckoutPage.jsx - Review items, delivery address (auto-fill from company/department), delivery notes textarea, priority selector (Low, Medium, High, Urgent), department selector (if multi-department), budget confirmation, submit order button, success: redirect to confirmation page

3. OrderConfirmationPage.jsx - Order number display, success message, order summary, next steps (awaiting approval), actions (view order, continue shopping)
```

### Days 33-34: Order Management

```
Create order management pages:

1. OrderHistoryPage.jsx - Orders list (table or cards), columns (Order #, Date, Items, Total, Status, Actions), filter by status dropdown, date range filter, search by order number, status badges with colors (PENDING_APPROVAL: orange, APPROVED: blue, PROCESSING: blue, SHIPPED: purple, DELIVERED: green, REJECTED: red, CANCELLED: gray), actions (view details, reorder, cancel if pending)

2. OrderDetailPage.jsx - Order header (number, date, status), order items table, approval timeline, delivery info, invoice download (if available), cancel button (if PENDING_APPROVAL), track shipment (if shipped)

3. ApprovalQueuePage.jsx (for managers) - Pending approvals list, quick view in modal, approve/reject buttons, rejection reason textarea, bulk actions (approve multiple), sort by priority/date/amount
```

### Day 35: Budget & Management Pages

```
Create budget management pages:

1. BudgetDashboardPage.jsx (Company Admin) - Company budget overview card, budget allocation by department (bar chart), spending trends (line chart, last 12 months), department budget table (Department, Allocated, Spent, Remaining, % Used) with progress bars and alert icons, allocate budget button

2. DepartmentBudgetPage.jsx (Department Manager) - Department name and period, budget status card (circular progress), category breakdown (pie chart), monthly spending trend (line chart), recent transactions table, request additional budget button

3. BudgetAllocationModal.jsx (Company Admin) - Select department, fiscal year/quarter, amount input, category (optional), notes textarea, submit

4. EmployeeManagementPage.jsx (Company Admin) - Employees table, columns (Name, Email, Department, Role, Status, Actions), filter (department, role, status), search, add employee button, actions (edit, deactivate, reset password), bulk import CSV

5. AddEmployeeModal.jsx - Form (firstName, lastName, email, phone, department, role), validation, submit, success message

6. DepartmentManagementPage.jsx (Company Admin) - Departments grid/list showing name, manager, employee count, budget status, add department button, edit/delete actions

7. AddDepartmentModal.jsx - Name, code, manager selector, monthly budget, cost center, validation

8. SupplierManagementPage.jsx (Procurement) - Suppliers table (Name, Contact, Products, Rating, Status, Actions), add supplier, view details

9. InventoryManagementPage.jsx (Procurement) - Inventory overview, filter (department, product, location), low stock alerts, reorder recommendations, update stock, consumption forecast charts

10. AnalyticsDashboardPage.jsx - Key metrics cards (total spend this month, active orders, pending approvals, budget utilization), spending trends chart (line), top spending departments (bar), top products (table), supplier performance (bar), recent activity feed

11. ReportsPage.jsx - Report type selector, filter options (date range, department), generate report button, export options (PDF, Excel, CSV), scheduled reports section

12. ProfilePage.jsx - User info card (editable), company info (read-only for non-admins), change password section, notification preferences, save changes

13. CompanySettingsPage.jsx (Company Admin) - Company details (editable), logo upload, subscription info, upgrade button, billing history

14. NotificationPreferencesPage.jsx - Toggle switches for each notification type, email and in-app options, save preferences
```

### SHARED COMPONENTS

```
Create reusable components:

1. Navbar.jsx - Logo (links to dashboard), navigation links (role-based), cart icon with badge (item count), notifications bell with badge (unread count), user menu dropdown (Profile, Settings, Logout)

2. Footer.jsx - Company info, links (About, Contact, Terms, Privacy), copyright

3. ProtectedRoute.jsx - Check authentication, check role authorization, redirect to login if not authenticated

4. BudgetTracker.jsx - Budget status bar, colors (green <80%, orange 80-100%, red >100%), displays remaining amount

5. ApprovalQueue.jsx (widget) - Mini list of pending approvals, quick approve/reject, view details link

6. NotificationBell.jsx - Bell icon with badge, dropdown with recent notifications, mark as read action, view all link

7. SearchBar.jsx - Search input with icon, auto-complete suggestions, search products or orders

8. StatusBadge.jsx - Display status with appropriate color, reusable for orders, employees, etc.

9. ConfirmDialog.jsx - Reusable confirmation modal for delete, cancel, reject actions

10. LoadingSpinner.jsx - Full-page or inline loading indicator
```

---

## 🧪 WEEK 6: TESTING (Days 36-42)

### Days 36-38: Backend Testing

```
Create comprehensive backend tests:

1. Unit Tests (JUnit 5 + Mockito) - Test all service methods, mock repository and external dependencies, test business logic (budget validation, approval workflow, stock reduction), test edge cases and error handling

2. Integration Tests (Spring Boot Test) - Test controller endpoints, use @WebMvcTest for controllers, @DataJpaTest for repositories, test full request/response cycle, test authentication and authorization

3. Test Coverage - Aim for >80% code coverage, use JaCoCo for coverage reports

Create test classes: AuthControllerTest, OrderServiceTest, BudgetServiceTest, ApprovalWorkflowServiceTest, InventoryServiceTest, etc.

Add test dependencies to pom.xml: spring-boot-starter-test, junit-jupiter, mockito-core, h2 (in-memory database)
```

### Days 39-40: Frontend Testing

```
Create frontend tests:

1. Component Tests (React Testing Library) - Test all major components, test user interactions, test form validation, test conditional rendering

2. E2E Tests (Cypress or Playwright) - Test critical user flows: register company and verify email, login and navigate dashboard, browse catalog and add to cart, checkout and place order, approve order as manager, view order history

Create test files: LandingPage.test.js, LoginPage.test.js, CartPage.test.js, OrderFlow.cy.js (Cypress)

Add test scripts to package.json: npm test (unit), npm run test:e2e (E2E)
```

### Days 41-42: Deployment Setup

```
Prepare for production deployment:

1. Backend - Create application-prod.properties with production database (PostgreSQL on cloud), production JWT secret (long random string), email service (SendGrid/AWS SES/Gmail), CORS for production frontend URL

2. Backend Dockerfile:
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/anyoffice-backend-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

3. Database Migration - Ensure all Flyway migrations production-ready, test on staging database, plan zero-downtime deployments

4. Security Hardening - Enable HTTPS only, set secure HTTP headers, rate limiting for API endpoints, input validation and sanitization, SQL injection prevention (JPA/Hibernate), CSRF protection

5. Logging & Monitoring - Configure Logback for production (ERROR for prod, INFO for staging), integrate with logging service (ELK, Datadog, CloudWatch), add health check: GET /actuator/health, add metrics: GET /actuator/metrics

6. Build Backend - Run: mvn clean package -DskipTests, JAR in target/ directory

7. Frontend - Create .env.production with production API URL, configure Google Analytics, set feature flags

8. Build Optimization - Code splitting, lazy loading for routes, image optimization, minification and compression

9. Build Frontend - Run: npm run build, build in build/ directory

10. Frontend Dockerfile:
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

11. Nginx Config - Serve React app, handle routing (redirect all to index.html), gzip compression, security headers

12. Cloud Deployment - Choose AWS/Azure/GCP/Heroku, deploy backend on Elastic Beanstalk/ECS/App Service/Cloud Run, use RDS/Cloud SQL for PostgreSQL, use S3/Blob Storage/Cloud Storage for files, deploy frontend on S3+CloudFront/Static Web Apps/Firebase Hosting

13. Setup CI/CD - Use GitHub Actions, automatic deployment on push to main, run tests before deployment

14. Production Database - Provision PostgreSQL, create anyoffice_db, configure connection pooling, set up daily backups, enable point-in-time recovery, run Flyway migrations, seed initial data (super admin, sample categories, system config), restrict access (whitelist IPs), use SSL connections, strong password, separate read-only user for analytics

15. Monitoring - Query performance monitoring, alert on slow queries, monitor connection pool usage
```

---

## 🚀 FINAL STEPS: LAUNCH (Days 43-45)

### Final Testing & Launch

```
Final testing checklist:

FUNCTIONAL TESTING:
- Test all user flows end-to-end
- Test with different roles
- Test edge cases
- Test error scenarios

PERFORMANCE TESTING:
- Load testing (Apache JMeter or k6)
- Test with 1000+ concurrent users
- Database query optimization
- API response time <500ms

SECURITY TESTING:
- Penetration testing
- SQL injection prevention
- XSS prevention
- CSRF protection
- Authentication/authorization testing

USABILITY TESTING:
- Test with real users
- Gather feedback
- Improve UX based on feedback

BROWSER COMPATIBILITY:
- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers

ACCESSIBILITY TESTING:
- WCAG compliance
- Screen reader compatibility
- Keyboard navigation
```

```
Create comprehensive documentation:

1. User Documentation - User guide for employees, admin guide for company admins, procurement officer guide, FAQ section

2. API Documentation - Use Swagger/OpenAPI, document all endpoints, include examples, auto-generate from code

3. Developer Documentation - System architecture, database schema, deployment guide, contributing guide

4. Video Tutorials - Getting started video, how to place order, how to approve orders, how to manage budgets
```

```
Pre-launch checklist:

INFRASTRUCTURE:
✅ Production servers ready
✅ Database configured and backed up
✅ SSL certificates installed
✅ CDN configured
✅ Monitoring tools active
✅ Error tracking (Sentry)

APPLICATION:
✅ All features tested
✅ No critical bugs
✅ Performance optimized
✅ Security hardened

LEGAL & COMPLIANCE:
✅ Terms of Service
✅ Privacy Policy
✅ Data protection compliance (GDPR, POPIA)
✅ Cookie policy

MARKETING:
✅ Landing page ready
✅ Email templates ready
✅ Social media accounts created
✅ Press release prepared

SUPPORT:
✅ Support email/ticket system
✅ Live chat integration
✅ Support team trained
```

```
Soft launch strategy:

BETA TESTING:
- Invite 5-10 friendly companies
- Collect detailed feedback
- Fix critical issues
- Monitor system performance

GRADUAL ROLLOUT:
- Week 1: 10 companies
- Week 2: 50 companies
- Week 3: 100 companies
- Month 2: Open to public

MONITORING:
- Watch error rates
- Monitor server load
- Track user behavior
- Collect feedback continuously

ITERATION:
- Release weekly updates
- Fix bugs quickly
- Add small improvements
- Build based on user feedback
```

---

## 🎯 TECH STACK SUMMARY

**Backend:**
- Spring Boot 3.2.0, Java 17
- PostgreSQL, JPA/Hibernate, Flyway
- Spring Security + JWT
- Spring Mail
- Maven

**Frontend:**
- React 18, React Router 6
- Material-UI (MUI) 5
- Axios, Recharts
- Context API + Hooks

**DevOps:**
- Docker
- GitHub Actions
- AWS/Azure/GCP/Heroku
- CloudWatch/Datadog
- Sentry

---

## 📊 KEY FEATURES CHECKLIST

### MUST-HAVE (MVP)
- ✅ Authentication & Authorization (5 roles)
- ✅ Company & Department Management
- ✅ Employee Management  
- ✅ Product Catalog (10 categories)
- ✅ Shopping Cart
- ✅ Order Placement
- ✅ Approval Workflows (multi-level)
- ✅ Budget Management & Tracking
- ✅ Inventory Management
- ✅ Supplier Management
- ✅ Analytics & Reporting
- ✅ Notifications (Email + In-app)

### NICE-TO-HAVE (Post-MVP)
- 🔲 AI Recommendations
- 🔲 RFQ System
- 🔲 Contract Management
- 🔲 Multi-location Support
- 🔲 Mobile App (PWA/Native)
- 🔲 Payment Gateway Integration

---

## 💰 MONETIZATION

**Subscription Tiers:**
1. **Basic** - R999/month (Free 3 months trial)
   - Up to 20 employees
   - 500 orders/month
   - Basic analytics

2. **Professional** - R2,999/month
   - Up to 100 employees
   - Unlimited orders
   - Advanced analytics
   - Custom approval workflows

3. **Enterprise** - Custom pricing
   - Unlimited employees
   - Dedicated account manager
   - Custom integrations
   - SLA guarantee

---

## 🎓 DEVELOPMENT TIMELINE

**With 1 Full-Stack Developer:** 60-65 days

**Recommended Team (4-5 people):**
- 1 Backend Developer
- 1 Frontend Developer
- 1 UI/UX Designer
- 1 QA Tester
- 1 DevOps Engineer

**Timeline:** 40-45 days with full team

---

## ✨ GO LIVE!

Once all prompts are executed and testing is complete:

1. Deploy to production
2. Run final smoke tests
3. Launch to first 10 beta companies
4. Monitor closely for 1 week
5. Gradual rollout to more companies
6. Iterate based on feedback

**CONGRATULATIONS! 🎉 AnyOffice is now LIVE!** 🚀

---

📝 **TIP:** Execute these prompts in order with your AI assistant or development team. Each prompt is self-contained and includes all necessary context.
