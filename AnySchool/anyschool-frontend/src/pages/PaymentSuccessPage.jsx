import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

/**
 * Payment Success Page
 * 
 * Shows order confirmation after successful payment.
 * 
 * Features:
 * - Display success message
 * - Show order number
 * - Display order details
 * - Links to continue shopping or go home
 */
const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchOrder();
  }, [orderId, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        API_ENDPOINTS.ORDERS.BY_ID(orderId),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        setError('Failed to load order');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load order. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `R${parseFloat(price).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
      case 'ACKNOWLEDGED':
      case 'IN_PROCESS':
      case 'FINALIZING':
        return 'info';
      case 'OUT_FOR_DELIVERY':
      case 'DELIVERED':
        return 'primary';
      case 'CLOSED':
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
      case 'DECLINED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
          >
            Go Home
          </Button>
        </Box>
      </Container>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Success Header */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
            color: 'white',
            mb: 4
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            {order.orderType === 'DONATION' ? 'Donation Successful!' : 'Payment Successful!'}
          </Typography>
          <Typography variant="h6">
            {order.orderType === 'DONATION' 
              ? 'Thank you for your generous donation'
              : 'Your order has been placed successfully'}
          </Typography>
        </Paper>

        {/* Order Details */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5">
                Order Confirmation
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Order #{order.id}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip 
                label={order.status} 
                color={getStatusColor(order.status)}
                icon={<CheckCircleIcon />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h6" color="primary">
                {formatPrice(order.totalAmount)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                School
              </Typography>
              <Typography variant="body1">
                {order.school.name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Student
              </Typography>
              <Typography variant="body1">
                {order.studentName} (Grade {order.studentGrade})
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Items
              </Typography>
              <Typography variant="body1">
                {order.itemCount} item(s)
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Next Steps */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            What's Next?
          </Typography>
          {order.orderType === 'DONATION' ? (
            <>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your donation is being processed. You will receive a confirmation email shortly with details about your contribution.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Your donation will be prepared for delivery<br />
                • The school will be notified of your generous contribution<br />
                • Stationery will be delivered to {order.school.name}<br />
                • You'll receive updates on the impact of your donation
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your order is being processed. You will receive a confirmation email shortly with details about delivery.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Your order will be prepared for delivery<br />
                • You'll receive updates on your order status<br />
                • Delivery will be arranged to {order.school.name}
              </Typography>
            </>
          )}
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/stationery')}
            startIcon={<ShoppingCartIcon />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage;
