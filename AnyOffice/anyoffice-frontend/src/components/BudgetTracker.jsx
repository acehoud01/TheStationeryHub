import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const BudgetTracker = ({ allocated, spent, label }) => {
  const pct = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
  const color = pct > 100 ? 'error' : pct > 80 ? 'warning' : 'primary';
  const remaining = allocated - spent;

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={500} gutterBottom>{label}</Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          R{spent?.toLocaleString()} spent
        </Typography>
        <Typography variant="caption" color={remaining < 0 ? 'error.main' : 'text.secondary'}>
          {remaining >= 0 ? `R${remaining?.toLocaleString()} left` : `R${Math.abs(remaining)?.toLocaleString()} over`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={color}
        sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Budget: R{allocated?.toLocaleString()} · {pct.toFixed(1)}% used
      </Typography>
    </Box>
  );
};

export default BudgetTracker;
