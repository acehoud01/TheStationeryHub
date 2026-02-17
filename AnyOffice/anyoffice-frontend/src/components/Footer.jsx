import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';

const Footer = () => (
  <Box
    component="footer"
    sx={{ bgcolor: 'primary.main', color: 'rgba(255,255,255,0.85)', py: 4, mt: 'auto' }}
  >
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, mb: 1, color: 'white' }}>
            AnyOffice
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            B2B Office Procurement Platform. Streamline your office supply chain with smart approvals and budget management.
          </Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.light' }}>Platform</Typography>
          {['Dashboard', 'Catalog', 'Orders', 'Analytics'].map((item) => (
            <Typography key={item} variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>{item}</Typography>
          ))}
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.light' }}>Management</Typography>
          {['Departments', 'Employees', 'Budget', 'Inventory'].map((item) => (
            <Typography key={item} variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>{item}</Typography>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'secondary.light' }}>Contact</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>support@anyoffice.co.za</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>+27 (0) 11 000 0000</Typography>
        </Grid>
      </Grid>
      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.15)', mt: 3, pt: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          © {new Date().getFullYear()} AnyOffice — B2B Office Procurement · All rights reserved
        </Typography>
      </Box>
    </Container>
  </Box>
);

export default Footer;
