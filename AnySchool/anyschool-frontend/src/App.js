import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UnreadMessagesAlert from './components/UnreadMessagesAlert';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import StationeryCatalogPage from './pages/StationeryCatalogPage';
import SchoolsListPage from './pages/SchoolsListPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import DonorDashboardPage from './pages/DonorDashboardPage';
import SchoolDashboardPage from './pages/SchoolDashboardPage';
import SchoolOnboardingPage from './pages/SchoolOnboardingPage';
import ChildrenManagementPage from './pages/ChildrenManagementPage';
import ChildProfilePage from './pages/ChildProfilePage';
import SchoolCommunicationsPage from './pages/SchoolCommunicationsPage';
import ParentCommunicationsPage from './pages/ParentCommunicationsPage';
import AdminPage from './pages/AdminPage';
import PurchasingAdminDashboardPage from './pages/PurchasingAdminDashboardPage';
import ParentDashboardPage from './pages/ParentDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SupplierManagementPage from './pages/SupplierManagementPage';
import BusinessAnalyticsPage from './pages/BusinessAnalyticsPage';
import SupplierProposalGeneratorPage from './pages/SupplierProposalGeneratorPage';

const NotFound = () => (
  <Box sx={{ textAlign:'center', mt:12, fontFamily:'"Cormorant Garamond",serif', fontSize:'2rem', color:'#1B3A2D' }}>
    <Box sx={{ fontSize:'4rem' }}>404</Box>
    Page not found
  </Box>
);

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <AuthProvider>
      <CartProvider>
        <Box sx={{ minHeight:'100vh', bgcolor:'background.default', display:'flex', flexDirection:'column' }}>
          {!isLandingPage && <Navbar />}
          <UnreadMessagesAlert />
          <Box sx={{ flex:1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/stationery" element={<StationeryCatalogPage />} />
              <Route path="/catalog" element={<StationeryCatalogPage />} />
              <Route path="/schools" element={<SchoolsListPage />} />
              <Route path="/cart" element={<CartPage />} />

              <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/payment/success/:orderId" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />

              <Route path="/children" element={<ProtectedRoute requireRole="PARENT"><ChildrenManagementPage /></ProtectedRoute>} />
              <Route path="/children/:id" element={<ProtectedRoute requireRole="PARENT"><ChildProfilePage /></ProtectedRoute>} />
              <Route path="/communications" element={<ProtectedRoute requireRole="PARENT"><ParentCommunicationsPage /></ProtectedRoute>} />
              <Route path="/parent/dashboard" element={<ProtectedRoute requireRole="PARENT"><ParentDashboardPage /></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              <Route path="/donor/dashboard" element={<ProtectedRoute requireRole="DONOR"><DonorDashboardPage /></ProtectedRoute>} />

              <Route path="/school/onboarding" element={<ProtectedRoute requireRole="SCHOOL_ADMIN"><SchoolOnboardingPage /></ProtectedRoute>} />
              <Route path="/school/dashboard" element={<ProtectedRoute requireRole="SCHOOL_ADMIN"><SchoolDashboardPage /></ProtectedRoute>} />
              <Route path="/school/communications" element={<ProtectedRoute requireRole={["SCHOOL_ADMIN", "SUPER_ADMIN"]}><SchoolCommunicationsPage /></ProtectedRoute>} />

              <Route path="/purchasing/dashboard" element={<ProtectedRoute requireRole="PURCHASING_ADMIN"><PurchasingAdminDashboardPage /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute requireRole="SUPER_ADMIN"><AdminPage /></ProtectedRoute>} />
              <Route path="/admin/suppliers" element={<ProtectedRoute requireRole="SUPER_ADMIN"><SupplierManagementPage /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute requireRole="SUPER_ADMIN"><BusinessAnalyticsPage /></ProtectedRoute>} />
              <Route path="/admin/proposal-generator" element={<ProtectedRoute requireRole="SUPER_ADMIN"><SupplierProposalGeneratorPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          {!isLandingPage && <Footer />}
        </Box>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;