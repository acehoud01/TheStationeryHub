import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ApprovalQueuePage from './pages/ApprovalQueuePage';
import BudgetManagementPage from './pages/BudgetManagementPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const HIDE_NAV_PATHS = ['/', '/login', '/register', '/verify-otp'];

function App() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PATHS.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNav && <Navbar />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/catalog" element={<CatalogPage />} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Protected — managers and above */}
          <Route path="/approvals" element={
            <ProtectedRoute requireRole={['DEPARTMENT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <ApprovalQueuePage />
            </ProtectedRoute>
          } />
          <Route path="/budget" element={
            <ProtectedRoute requireRole={['DEPARTMENT_MANAGER', 'PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <BudgetManagementPage />
            </ProtectedRoute>
          } />

          {/* Protected — company admin and above */}
          <Route path="/departments" element={
            <ProtectedRoute requireRole={['COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <DepartmentManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute requireRole={['COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <EmployeeManagementPage />
            </ProtectedRoute>
          } />

          {/* Protected — procurement officer and above */}
          <Route path="/inventory" element={
            <ProtectedRoute requireRole={['PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <InventoryPage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute requireRole={['PROCUREMENT_OFFICER', 'COMPANY_ADMIN', 'SUPER_ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />

          {/* Protected — super admin only */}
          <Route path="/admin" element={
            <ProtectedRoute requireRole="SUPER_ADMIN">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Box>
      {!hideNav && <Footer />}
    </Box>
  );
}

export default App;
