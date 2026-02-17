import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

/**
 * NewOrderAlert Component
 * 
 * Displays a popup alert when purchasing admin has new orders to acknowledge.
 * Shows donor/parent/school name and school/student info.
 * 
 * Features:
 * - Auto-check for new orders on mount
 * - Display order details with donor/customer info
 * - Differentiate between donation, parent, and school orders
 * - Acknowledge action to dismiss
 */
const NewOrderAlert = ({ onDismiss }) => {
  const [open, setOpen] = useState(false);
  const [newOrders, setNewOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForNewOrders();
  }, []);

  const checkForNewOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        API_ENDPOINTS.PURCHASING.NEW_ORDERS,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.count > 0) {
        setNewOrders(response.data.orders);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const getOrderDescription = (order) => {
    // Determine order type and format message
    if (order.orderType === 'DONATION') {
      const donorName = order.user?.fullName || 'Anonymous Donor';
      const schoolName = order.school?.name || order.requestedSchoolName || 'Unknown School';
      return {
        title: `New donation order from ${donorName}`,
        subtitle: `For: ${schoolName}`,
        type: 'donation'
      };
    } else if (order.orderType === 'PURCHASE' && order.studentName) {
      // Parent order (has student details)
      const parentName = order.user?.fullName || 'Parent';
      const studentName = order.studentName || 'Student';
      const schoolName = order.school?.name || order.requestedSchoolName || 'Unknown School';
      return {
        title: `New order from ${parentName}`,
        subtitle: `For: ${studentName} at ${schoolName}`,
        type: 'parent'
      };
    } else if (order.orderType === 'PURCHASE') {
      // School admin order (no student details)
      const schoolName = order.school?.name || order.requestedSchoolName || 'Unknown School';
      return {
        title: `New order from ${schoolName}`,
        subtitle: `School order placed by admin`,
        type: 'school'
      };
    } else {
      return {
        title: 'New order received',
        subtitle: 'Order details available',
        type: 'other'
      };
    }
  };

  const getChipColor = (type) => {
    switch (type) {
      case 'donation': return 'success';
      case 'parent': return 'primary';
      case 'school': return 'secondary';
      default: return 'default';
    }
  };

  if (loading || newOrders.length === 0) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 6,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'white',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsActiveIcon />
          <Typography variant="h6" component="span">
            New Orders Alert
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          You have {newOrders.length} new {newOrders.length === 1 ? 'order' : 'orders'} awaiting acknowledgment:
        </Typography>

        <List sx={{ mt: 2 }}>
          {newOrders.map((order, index) => {
            const description = getOrderDescription(order);
            return (
              <React.Fragment key={order.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <ListItem
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Chip
                      label={description.type.toUpperCase()}
                      color={getChipColor(description.type)}
                      size="small"
                    />
                    <Chip
                      label={`Order #${order.id}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                  
                  <ListItemText
                    primary={description.title}
                    secondary={description.subtitle}
                    primaryTypographyProps={{
                      fontWeight: 'bold',
                      color: 'text.primary'
                    }}
                    secondaryTypographyProps={{
                      color: 'text.secondary',
                      fontSize: '0.875rem'
                    }}
                  />
                  
                  <Typography variant="body2" color="text.secondary">
                    Amount: <strong>R{parseFloat(order.totalAmount).toFixed(2)}</strong>
                  </Typography>
                  
                  <Typography variant="caption" color="text.disabled">
                    Received: {new Date(order.createdAt).toLocaleString()}
                  </Typography>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleClose}
          size="large"
        >
          View Orders
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewOrderAlert;
