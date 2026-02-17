import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

/**
 * Payment Page
 * 
 * Shows order summary and mock payment options.
 * 
 * Features:
 * - Display order details
 * - List order items
 * - Show total amount
 * - Mock payment buttons (PayFast, EFT, Cash)
 * - Update order status to APPROVED (payment processed)
 * - Navigate to success page
 */
const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

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

  const handlePayment = async (paymentMethod) => {
    try {
      setPaymentLoading(true);
      setSelectedMethod(paymentMethod);
      setError('');

      const token = localStorage.getItem('token');

      // Generate mock payment reference
      const paymentReference = `${paymentMethod.toUpperCase()}-${Date.now()}`;

      console.log('Sending payment request:', {
        orderId,
        status: 'APPROVED',
        paymentReference
      });

      // Update order status to APPROVED (payment complete, ready for purchasing)
      const response = await axios.put(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        {
          status: 'APPROVED',
          paymentReference: paymentReference
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Payment response:', response.data);

      if (response.data.success) {
        // Simulate payment processing delay
        setTimeout(() => {
          // Navigate to success page
          navigate(`/payment/success/${orderId}`);
        }, 1500);
      } else {
        setError(response.data.message || 'Payment failed. Please try again.');
        setPaymentLoading(false);
        setSelectedMethod('');
      }
    } catch (err) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response?.data);
      const message = err.response?.data?.message || err.message || 'Payment failed. Please try again.';
      setError(message);
      setPaymentLoading(false);
      setSelectedMethod('');
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

  if (error && !order) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Payment
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Order #{order.id}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Order Details */}
          <Grid item xs={12} md={8}>
            {/* Order Summary */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Order Summary
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      School
                    </Typography>
                    <Typography variant="body1">
                      {order.school.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Student Name
                    </Typography>
                    <Typography variant="body1">
                      {order.studentName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Grade
                    </Typography>
                    <Typography variant="body1">
                      Grade {order.studentGrade}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Academic Year
                    </Typography>
                    <Typography variant="body1">
                      {order.academicYear}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Type
                    </Typography>
                    <Chip 
                      label={order.paymentType === 'IMMEDIATE' ? 'Pay Now' : 'Payment Plan'} 
                      color={order.paymentType === 'IMMEDIATE' ? 'primary' : 'success'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Payment Plan Details */}
            {order.paymentType === 'PAYMENT_PLAN' && order.monthlyInstalment && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#F0F9F4', border: '1px solid #4CAF50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AccountBalanceIcon color="success" />
                  <Typography variant="h6" color="success.main">
                    Payment Plan Details
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Instalment
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    R {parseFloat(order.monthlyInstalment).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Over {order.paymentPlanMonths} months
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Debit Order Schedule:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  • Day of month: {order.debitOrderDay === 31 ? 'Last day of month' : order.debitOrderDay === 1 ? '1st' : `${order.debitOrderDay}th`}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5, fontFamily: '"Inter", sans-serif' }}>
                  • First payment: {order.firstDebitDate ? new Date(order.firstDebitDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5, fontFamily: '"Inter", sans-serif' }}>
                  • Last payment: {order.lastDebitDate ? new Date(order.lastDebitDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD'}
                </Typography>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Status: Awaiting final payment
                </Alert>
              </Paper>
            )}

            {/* Delivery Information */}
            {order.academicYear && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: '#FFF9E6', border: '1px solid #FFC107' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6">
                    📦 Delivery Information
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Academic Year:</strong> {order.academicYear}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {parseInt(order.academicYear) === new Date().getFullYear()
                    ? '✓ Estimated delivery: 5-10 working days after payment confirmation'
                    : `📅 Estimated delivery: First week of January ${order.academicYear} (To be confirmed)`}
                </Typography>
              </Paper>
            )}

            {/* Order Items */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Order Items
              </Typography>

              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {item.stationery.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.stationery.brand && `${item.stationery.brand} • `}
                              {item.stationery.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatPrice(item.price)}
                        </TableCell>
                        <TableCell align="center">
                          {item.quantity}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatPrice(item.subtotal)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Payment Section */}
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Payment
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Total */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Payment Methods - Only show for immediate payment */}
                {order.paymentType === 'IMMEDIATE' && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Select Payment Method
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      This is a demo. No actual payment will be processed.
                    </Typography>

                    {/* PayFast Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => handlePayment('payfast')}
                  disabled={paymentLoading}
                  startIcon={paymentLoading && selectedMethod === 'payfast' ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#ff6900', 
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    boxShadow: 3,
                    '&:hover': { 
                      bgcolor: '#e55f00',
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: 2
                    },
                    cursor: 'pointer'
                  }}
                >
                  {paymentLoading && selectedMethod === 'payfast' ? 'Processing...' : 'Pay with PayFast'}
                </Button>

                {/* EFT Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => handlePayment('eft')}
                  disabled={paymentLoading}
                  startIcon={paymentLoading && selectedMethod === 'eft' ? <CircularProgress size={20} color="inherit" /> : <AccountBalanceIcon />}
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#2196f3', 
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    boxShadow: 3,
                    '&:hover': { 
                      bgcolor: '#1976d2',
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: 2
                    },
                    cursor: 'pointer'
                  }}
                >
                  {paymentLoading && selectedMethod === 'eft' ? 'Processing...' : 'Pay with EFT'}
                </Button>

                {/* Cash Button */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => handlePayment('cash')}
                  disabled={paymentLoading}
                  startIcon={paymentLoading && selectedMethod === 'cash' ? <CircularProgress size={20} color="inherit" /> : <LocalAtmIcon />}
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#4caf50', 
                    color: 'white',
                    fontWeight: 'bold',
                    py: 1.5,
                    boxShadow: 3,
                    '&:hover': { 
                      bgcolor: '#388e3c',
                      boxShadow: 6,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: 2
                    },
                    cursor: 'pointer'
                  }}
                >
                  {paymentLoading && selectedMethod === 'cash' ? 'Processing...' : 'Pay Cash on Delivery'}
                </Button>
                  </>
                )}

                {/* Payment Plan Message */}
                {order.paymentType === 'PAYMENT_PLAN' && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Payment Plan Activated
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your order has been successfully placed with a payment plan.
                      Monthly debit orders will start on the scheduled date.
                    </Typography>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => navigate('/')}
                      sx={{ mt: 1 }}
                    >
                      View Orders
                    </Button>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Back Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/')}
                  startIcon={<ArrowBackIcon />}
                  disabled={paymentLoading}
                >
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PaymentPage;
