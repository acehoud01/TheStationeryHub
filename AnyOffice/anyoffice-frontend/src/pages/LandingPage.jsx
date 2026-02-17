import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Card, CardContent,
  Chip
} from '@mui/material';
import {
  Business, CheckCircle, TrendingUp, Security, Speed, Group
} from '@mui/icons-material';

const features = [
  { icon: <Business color="primary" />, title: 'Multi-Company Support', desc: 'Manage procurement across multiple companies with isolated data and custom workflows.' },
  { icon: <CheckCircle color="primary" />, title: 'Smart Approval Workflows', desc: 'Tiered approvals based on order value. Auto-approve small orders, escalate large ones.' },
  { icon: <TrendingUp color="primary" />, title: 'Budget Management', desc: 'Set department budgets, track spend in real time, and get alerts before overruns.' },
  { icon: <Security color="primary" />, title: 'Role-Based Access', desc: 'Fine-grained control: Employee, Manager, Procurement Officer, Company Admin.' },
  { icon: <Speed color="primary" />, title: 'Fast Procurement', desc: 'Browse shared catalog, add to cart, place orders in seconds. Mobile-friendly.' },
  { icon: <Group color="primary" />, title: 'Team Management', desc: 'Onboard employees, assign departments, manage roles all from one dashboard.' },
];

const tiers = [
  { name: 'Basic', price: 'R499', period: '/mo', features: ['Up to 50 employees', '5 departments', 'Email support'], color: 'default' },
  { name: 'Professional', price: 'R1,499', period: '/mo', features: ['Up to 200 employees', '20 departments', 'Analytics & reports', 'Priority support'], color: 'primary', recommended: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited employees', 'Unlimited departments', 'Custom integrations', 'Dedicated account manager'], color: 'default' },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #1A2E44 0%, #2C4A6E 100%)', color: 'white', py: { xs: 8, md: 14 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip label="B2B Procurement Platform" sx={{ bgcolor: 'rgba(200,164,92,0.2)', color: '#C8A45C', border: '1px solid #C8A45C', mb: 3 }} />
          <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '2.2rem', md: '3.2rem' } }}>
            Streamline Your Office Procurement
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, mb: 5, fontWeight: 300, maxWidth: 600, mx: 'auto' }}>
            Centralise purchasing, automate approvals, and control budgets. The smart way to manage office supplies for growing businesses.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" color="secondary" size="large" onClick={() => navigate('/register')} sx={{ px: 5, py: 1.5, fontWeight: 700, fontSize: '1rem' }}>
              Start Free Trial
            </Button>
            <Button variant="outlined" size="large" sx={{ px: 5, py: 1.5, color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white' } }} onClick={() => navigate('/catalog')}>
              Browse Catalog
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" textAlign="center" fontWeight={700} mb={1}>Everything you need</Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
          A complete procurement platform built for South African businesses.
        </Typography>
        <Grid container spacing={4}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card sx={{ height: '100%', p: 1 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{f.icon}</Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" fontWeight={700} mb={1}>Simple Pricing</Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>Choose the plan that fits your business.</Typography>
          <Grid container spacing={4} justifyContent="center">
            {tiers.map((tier) => (
              <Grid item xs={12} sm={6} md={4} key={tier.name}>
                <Card sx={{ height: '100%', border: tier.recommended ? '2px solid' : '1px solid', borderColor: tier.recommended ? 'primary.main' : 'divider', position: 'relative' }}>
                  {tier.recommended && (
                    <Chip label="Most Popular" color="primary" size="small" sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }} />
                  )}
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight={700} mb={1}>{tier.name}</Typography>
                    <Typography variant="h3" fontWeight={800} color="primary.main">
                      {tier.price}<Typography component="span" variant="body1" color="text.secondary">{tier.period}</Typography>
                    </Typography>
                    <Box sx={{ mt: 3, mb: 4 }}>
                      {tier.features.map((feat) => (
                        <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckCircle fontSize="small" color="success" />
                          <Typography variant="body2">{feat}</Typography>
                        </Box>
                      ))}
                    </Box>
                    <Button fullWidth variant={tier.recommended ? 'contained' : 'outlined'} color="primary" onClick={() => navigate('/register')}>
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'rgba(255,255,255,0.8)', py: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          © {new Date().getFullYear()} AnyOffice — B2B Office Procurement · South Africa
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
