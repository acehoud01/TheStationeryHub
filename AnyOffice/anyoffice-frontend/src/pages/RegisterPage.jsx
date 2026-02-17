import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Container, Card, CardContent, Typography, TextField,
  Button, Alert, CircularProgress, Stepper, Step, StepLabel,
  ToggleButton, ToggleButtonGroup, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { Business, Person } from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../services/api.service';
import API from '../config/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState('COMPANY_ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '',
    companyName: '', companyIndustry: '', companyAddress: '',
    companyId: '', departmentId: '',
  });

  useEffect(() => {
    if (accountType === 'EMPLOYEE') {
      apiClient.get(API.COMPANIES.BASE).then((res) => {
        if (res.data.success) setCompanies(res.data.companies || []);
      }).catch(() => {});
    }
  }, [accountType]);

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleNext = () => {
    if (step === 0) { setStep(1); return; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        email: form.email, password: form.password, confirmPassword: form.confirmPassword,
        firstName: form.firstName, lastName: form.lastName, phoneNumber: form.phoneNumber,
        role: accountType,
      };
      if (accountType === 'COMPANY_ADMIN') {
        payload.companyName = form.companyName;
        payload.companyIndustry = form.companyIndustry;
        payload.companyAddress = form.companyAddress;
      } else {
        payload.companyId = form.companyId ? Number(form.companyId) : null;
        payload.departmentId = form.departmentId ? Number(form.departmentId) : null;
      }
      const res = await axios.post(API.AUTH.REGISTER, payload);
      if (res.data.success) {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', py: 4 }}>
      <Container maxWidth="sm">
        <Box textAlign="center" mb={3}>
          <Business sx={{ fontSize: 48, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ fontFamily: '"Cormorant Garamond", serif' }}>
            Join AnyOffice
          </Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stepper activeStep={step} sx={{ mb: 4 }}>
              <Step><StepLabel>Account Type</StepLabel></Step>
              <Step><StepLabel>Your Details</StepLabel></Step>
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {step === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>How will you use AnyOffice?</Typography>
                <ToggleButtonGroup
                  value={accountType}
                  exclusive
                  onChange={(_, v) => v && setAccountType(v)}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  <ToggleButton value="COMPANY_ADMIN" sx={{ py: 3, flexDirection: 'column', gap: 1 }}>
                    <Business />
                    <Typography variant="body2" fontWeight={600}>Company Admin</Typography>
                    <Typography variant="caption" color="text.secondary">Register a new company</Typography>
                  </ToggleButton>
                  <ToggleButton value="EMPLOYEE" sx={{ py: 3, flexDirection: 'column', gap: 1 }}>
                    <Person />
                    <Typography variant="body2" fontWeight={600}>Employee</Typography>
                    <Typography variant="caption" color="text.secondary">Join an existing company</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
                <Button variant="contained" fullWidth size="large" onClick={handleNext} sx={{ py: 1.5 }}>
                  Continue
                </Button>
              </Box>
            )}

            {step === 1 && (
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="First Name" required fullWidth value={form.firstName} onChange={handleChange('firstName')} />
                  <TextField label="Last Name" required fullWidth value={form.lastName} onChange={handleChange('lastName')} />
                </Box>
                <TextField label="Email Address" type="email" required fullWidth value={form.email} onChange={handleChange('email')} sx={{ mb: 2 }} />
                <TextField label="Phone Number" fullWidth value={form.phoneNumber} onChange={handleChange('phoneNumber')} sx={{ mb: 2 }} />
                <TextField label="Password" type="password" required fullWidth value={form.password} onChange={handleChange('password')} sx={{ mb: 2 }} helperText="Minimum 6 characters" />
                <TextField label="Confirm Password" type="password" required fullWidth value={form.confirmPassword} onChange={handleChange('confirmPassword')} sx={{ mb: 3 }} />

                {accountType === 'COMPANY_ADMIN' ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">Company Information</Typography>
                    <TextField label="Company Name" required fullWidth value={form.companyName} onChange={handleChange('companyName')} sx={{ mb: 2 }} />
                    <TextField label="Industry" fullWidth value={form.companyIndustry} onChange={handleChange('companyIndustry')} sx={{ mb: 2 }} />
                    <TextField label="Address" fullWidth value={form.companyAddress} onChange={handleChange('companyAddress')} sx={{ mb: 2 }} />
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">Company & Department</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Company</InputLabel>
                      <Select value={form.companyId} onChange={handleChange('companyId')} label="Company">
                        {companies.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" fullWidth onClick={() => setStep(0)}>Back</Button>
                  <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, fontWeight: 600 }}>
                    {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
                  </Button>
                </Box>
              </form>
            )}

            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Already have an account? <Link to="/login" style={{ color: '#1A2E44', fontWeight: 600 }}>Sign in</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default RegisterPage;
