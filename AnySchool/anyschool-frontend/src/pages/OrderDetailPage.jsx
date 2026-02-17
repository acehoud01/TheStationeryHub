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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import CancelIcon from '@mui/icons-material/Cancel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

/**
 * Order Detail Page
 * 
 * Displays full details of a single order.
 * 
 * Features:
 * - Order summary
 * - Order items list
 * - Total breakdown
 * - Status display
 * - Actions (Pay if pending, Cancel)
 */
const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [newQuantity, setNewQuantity] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, itemId: null });

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

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        {
          status: 'CANCELLED',
          paymentReference: null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Refresh order
        fetchOrder();
      } else {
        alert('Failed to cancel order');
      }
    } catch (err) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${API_ENDPOINTS.ORDERS.BY_ID(orderId)}/items/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setDeleteConfirm({ open: false, itemId: null });
        setOrder(response.data.order);
      } else {
        setError('Failed to remove item');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleUpdateItemQuantity = async (itemId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_ENDPOINTS.ORDERS.BY_ID(orderId)}/items/${itemId}`,
        { quantity: parseInt(newQuantity) },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setEditingItemId(null);
        setNewQuantity(1);
        setOrder(response.data.order);
      } else {
        setError('Failed to update item');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return `R ${parseFloat(price).toFixed(2)}`;
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

  if (error || !order) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Order not found'}
          </Alert>
          <Button
            variant="outlined"
            onClick={() => navigate('/orders')}
            startIcon={<ArrowBackIcon />}
          >
            Back to Orders
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h3" component="h1">
              Order Details
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Order #{order.id}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Order Summary */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ReceiptIcon sx={{ fontSize: 30, mr: 1, color: 'primary.main' }} />
                <Typography variant="h5">
                  Order Summary
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(order.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Order Type
                  </Typography>
                  <Typography variant="body1">
                    {order.orderType}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Items
                  </Typography>
                  <Typography variant="body1">
                    {order.itemCount}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    School
                  </Typography>
                  <Typography variant="body1">
                    {order.school.name}
                  </Typography>
                </Grid>

                {order.orderType === 'PURCHASE' && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Student Name
                      </Typography>
                      <Typography variant="body1">
                        {order.studentName}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Grade
                      </Typography>
                      <Typography variant="body1">
                        Grade {order.studentGrade}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Paper>

            {/* Order Items */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{ m: 0 }}>
                  Order Items
                </Typography>
                {order.isMarkedFinal && (
                  <Chip
                    label="Finalized - Cannot Edit"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>

              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="center">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      {!order.isMarkedFinal && <TableCell align="center">Actions</TableCell>}
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
                          {editingItemId === item.id ? (
                            <TextField
                              type="number"
                              size="small"
                              value={newQuantity}
                              onChange={(e) => setNewQuantity(e.target.value)}
                              inputProps={{ min: 1 }}
                              sx={{ width: 60 }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {formatPrice(item.subtotal)}
                          </Typography>
                        </TableCell>
                        {!order.isMarkedFinal && (
                          <TableCell align="center">
                            {editingItemId === item.id ? (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleUpdateItemQuantity(item.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setEditingItemId(null);
                                    setNewQuantity(1);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                <Tooltip title="Edit Quantity">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setEditingItemId(item.id);
                                      setNewQuantity(item.quantity);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Item">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => setDeleteConfirm({ open: true, itemId: item.id })}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Order Total & Actions */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Order Total
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatPrice(order.totalAmount)}
                </Typography>
              </Box>

              {/* Actions */}
              {order.status === 'PENDING' && (
                <>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={() => navigate(`/payment/${order.id}`)}
                    sx={{ mb: 2 }}
                  >
                    Pay Now
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelOrder}
                  >
                    Cancel Order
                  </Button>
                </>
              )}

              {order.status === 'PROCESSING' && (
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </Button>
              )}

              {(order.status === 'CLOSED' || order.status === 'COMPLETED') && (
                <Alert severity="success">
                  Order completed successfully!
                </Alert>
              )}

              {order.status === 'CANCELLED' && (
                <Alert severity="error">
                  This order has been cancelled.
                </Alert>
              )}
            </Paper>

            {/* Order Info */}
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Need help with this order?
              </Typography>
              <Typography variant="body2">
                Contact support with Order ID #{order.id}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, itemId: null })}>
          <DialogTitle>Delete Item?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove this item from your order?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm({ open: false, itemId: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteItem(deleteConfirm.itemId)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrderDetailPage;
