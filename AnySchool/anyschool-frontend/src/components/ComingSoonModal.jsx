import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Container } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ComingSoonModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.3s ease',
        backdropFilter: 'blur(8px)',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafb 100%)',
          borderRadius: '20px',
          p: { xs: 3, md: 4 },
          maxWidth: 480,
          width: '90%',
          boxShadow: `0 32px 64px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.15)`,
          border: '1px solid rgba(59, 130, 246, 0.1)',
          animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '@keyframes slideUp': {
            from: {
              transform: 'translateY(50px)',
              opacity: 0,
            },
            to: {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
        }}
      >
        {/* Close Button */}
        <Box
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            cursor: 'pointer',
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.25s ease',
            background: 'rgba(15, 23, 42, 0.05)',
            '&:hover': {
              background: 'rgba(15, 23, 42, 0.1)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <CloseIcon sx={{ color: '#64748b', fontSize: 20 }} />
        </Box>

        {/* Icon */}
        <Box
          sx={{
            fontSize: '3rem',
            mb: 2,
            display: 'inline-block',
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-12px)' },
            },
          }}
        >
          🚀
        </Box>

        {/* Heading */}
        <Typography
          sx={{
            fontFamily: `'Poppins', sans-serif`,
            fontSize: { xs: '1.6rem', md: '1.9rem' },
            fontWeight: 700,
            color: '#0f172a',
            mb: 0.5,
          }}
        >
          AnyOffice is Coming
        </Typography>

        <Typography
          sx={{
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: '#3b82f6',
            textTransform: 'uppercase',
            mb: 2,
            fontFamily: `'Poppins', sans-serif`,
          }}
        >
          ✦ Enterprise Solutions
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            color: '#64748b',
            lineHeight: 1.7,
            mb: 3,
            fontSize: '0.9rem',
            fontFamily: `'Poppins', sans-serif`,
          }}
        >
          We're building a revolutionary platform for businesses to manage their office supply chains with unprecedented efficiency and control.
        </Typography>

        {!subscribed ? (
          <Box component="form" onSubmit={handleSubscribe} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 0.8, mb: 2 }}>
              <TextField
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    background: 'rgba(15, 23, 42, 0.03)',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontFamily: `'Poppins', sans-serif`,
                    '&:hover': {
                      borderColor: '#3b82f6',
                    },
                    '&.Mui-focused': {
                      borderColor: '#3b82f6',
                      boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: '#94a3b8',
                    opacity: 1,
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 2.5,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontFamily: `'Poppins', sans-serif`,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    boxShadow: `0 8px 20px rgba(37, 99, 235, 0.4)`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Notify
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.06) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '12px',
              mb: 3,
              animation: 'slideInUp 0.5s ease',
              '@keyframes slideInUp': {
                from: {
                  transform: 'translateY(20px)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateY(0)',
                  opacity: 1,
                },
              },
            }}
          >
            <Typography sx={{ color: '#059669', fontWeight: 600, fontSize: '0.95rem', fontFamily: `'Poppins', sans-serif` }}>
              ✓ Thank you! We'll notify you when we launch.
            </Typography>
          </Box>
        )}

        {/* Features Grid */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.07) 0%, rgba(14, 165, 233, 0.05) 100%)',
            p: 2.5,
            borderRadius: '14px',
            border: '1px solid rgba(59, 130, 246, 0.15)',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 2,
              fontFamily: `'Poppins', sans-serif`,
            }}
          >
            What's Coming:
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {['📊 Smart Analytics', '💰 Cost Tracking', '🤝 Vendor Hub', '📦 Auto Reordering'].map((item, idx) => (
              <Typography
                key={idx}
                sx={{
                  fontSize: '0.85rem',
                  color: '#64748b',
                  fontWeight: 500,
                  fontFamily: `'Poppins', sans-serif`,
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ComingSoonModal;
