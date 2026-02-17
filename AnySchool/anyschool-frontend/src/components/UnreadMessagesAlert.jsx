import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const C = {
  forest: '#1B3A2D',
  gold: '#C8A45C',
  stone: '#8C8070',
  border: '#E5DED4',
};

export default function UnreadMessagesAlert({ onClose }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'SCHOOL_ADMIN' || user?.role === 'PARENT') {
      fetchUnreadMessages();
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.COMMUNICATIONS.UNREAD, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && res.data.unreadCount > 0) {
        setUnreadCount(res.data.unreadCount);
        setMessages(res.data.messages || []);
        setOpen(true);
      }
    } catch (e) {
      console.error('Failed to fetch unread messages:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_ENDPOINTS.COMMUNICATIONS.MARK_READ(messageId), {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the marked message from the list
      setMessages(messages.filter(m => m.id !== messageId));
      setUnreadCount(unreadCount - 1);

      // Close dialog if no more messages
      if (messages.length === 1) {
        handleClose();
      }
    } catch (e) {
      console.error('Failed to mark message as read:', e);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const getMessageSummary = () => {
    if (user?.role === 'SCHOOL_ADMIN') {
      return `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.`;
    } else if (user?.role === 'PARENT') {
      if (messages.length === 0) return '';
      
      const childrenSet = new Set(messages.map(m => m.childName));
      const schoolsSet = new Set(messages.map(m => m.schoolName));
      
      let summary = `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}.`;
      
      if (childrenSet.size === 1 && schoolsSet.size === 1) {
        const child = Array.from(childrenSet)[0];
        const school = Array.from(schoolsSet)[0];
        summary += ` For ${child} from ${school}.`;
      } else {
        const children = Array.from(childrenSet).join(', ');
        const schools = Array.from(schoolsSet).join(', ');
        summary += ` For ${children} from ${schools}.`;
      }
      return summary;
    }
    return '';
  };

  if (!open || loading) {
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
          borderRadius: '16px',
          background: '#FAF7F2',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forest}99 100%)`,
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.3rem',
        }}
      >
        <MailIcon />
        New Messages
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5, pb: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Summary message */}
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="body1"
              sx={{
                color: C.forest,
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              {getMessageSummary()}
            </Typography>
          </Box>

          {/* Messages list */}
          {messages.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '400px', overflowY: 'auto' }}>
              {messages.map(msg => (
                <Card
                  key={msg.id}
                  sx={{
                    border: `1px solid ${C.border}`,
                    background: '#fff',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(27, 58, 45, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: C.forest,
                            mb: 0.5,
                          }}
                        >
                          {msg.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: C.stone,
                            mb: 0.75,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {msg.message}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip
                            label={msg.type}
                            size="small"
                            sx={{
                              background: msg.type === 'URGENT' ? '#FEE2E2' : '#EFF6FF',
                              color: msg.type === 'URGENT' ? '#991B1B' : '#1D4ED8',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          {msg.childName && (
                            <Typography variant="caption" sx={{ color: C.stone }}>
                              {msg.childName}
                            </Typography>
                          )}
                          {msg.schoolName && (
                            <Typography variant="caption" sx={{ color: C.stone }}>
                              {msg.schoolName}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Button
                        size="small"
                        onClick={() => handleMarkAsRead(msg.id)}
                        sx={{
                          minWidth: 'auto',
                          color: C.forest,
                          '&:hover': { background: 'rgba(27, 58, 45, 0.1)' },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: '1.2rem' }} />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          background: '#F5EDD8',
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          sx={{
            fontWeight: 600,
            color: C.forest,
            '&:hover': {
              background: 'rgba(27, 58, 45, 0.1)',
            },
          }}
        >
          Close
        </Button>
        {messages.length > 0 && (
          <Button
            onClick={() => {
              messages.forEach(msg => handleMarkAsRead(msg.id));
            }}
            variant="contained"
            sx={{
              background: C.forest,
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: '#133B2D',
              },
            }}
          >
            Mark All as Read
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
