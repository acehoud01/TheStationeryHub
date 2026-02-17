import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Card, CardContent, Alert,
  CircularProgress, Stepper, Step, StepLabel, Radio, RadioGroup,
  FormControlLabel, TextField, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const C = {
  forest: '#1B3A2D', forestMid: '#2D5C47', gold: '#C8A45C',
  goldPale: '#F5EDD8', cream: '#FAF7F2', parchment: '#F0EBE0',
  border: '#E5DED4', ink: '#1C1814', stone: '#8C8070',
};

export default function SchoolOnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Choice (NEW_SCHOOL or LINK_EXISTING_SCHOOL)
  const [choice, setChoice] = useState('');

  // Step 2: Available schools (for LINK_EXISTING_SCHOOL)
  const [availableSchools, setAvailableSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  // Step 2: New school form (for NEW_SCHOOL)
  const [newSchoolForm, setNewSchoolForm] = useState({
    schoolName: '',
    phoneNumber: '',
    province: ''
  });

  // Step 3: Requests/Status
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'SCHOOL_ADMIN') {
      navigate('/');
      return;
    }

    if (user?.schoolId) {
      navigate('/school/dashboard');
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  const fetchAvailableSchools = async () => {
    setSchoolsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.SCHOOL_REQUESTS.AVAILABLE_SCHOOLS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setAvailableSchools(res.data.schools || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load schools');
    } finally {
      setSchoolsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.SCHOOL_REQUESTS.LIST, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleChoiceNext = async () => {
    if (!choice) {
      setError('Please select an option');
      return;
    }

    if (choice === 'LINK_EXISTING_SCHOOL') {
      await fetchAvailableSchools();
    }

    setStep(1);
  };

  const handleNewSchoolSubmit = async () => {
    if (!newSchoolForm.schoolName.trim() || !newSchoolForm.phoneNumber.trim() || !newSchoolForm.province.trim()) {
      setError('All fields are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_ENDPOINTS.SCHOOL_REQUESTS.NEW_SCHOOL,
        newSchoolForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccess('School request submitted successfully! A super admin will review it shortly.');
        setStep(2);
        await fetchRequests();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkSchoolSubmit = async () => {
    if (!selectedSchool) {
      setError('Please select a school');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_ENDPOINTS.SCHOOL_REQUESTS.LINK_SCHOOL,
        { schoolId: selectedSchool.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccess('Link request submitted successfully! A super admin will review it shortly.');
        setStep(2);
        await fetchRequests();
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#FEF9C3', color: '#854D0E', icon: <PendingIcon /> };
      case 'APPROVED':
        return { bg: '#DCFCE7', color: '#15803D', icon: <CheckCircleIcon /> };
      case 'REJECTED':
        return { bg: '#FEE2E2', color: '#991B1B', icon: <CloseIcon /> };
      default:
        return { bg: '#F3F4F6', color: '#374151', icon: <PendingIcon /> };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: C.cream }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ background: C.cream, minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Box sx={{
          background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`,
          borderRadius: '24px', p: { xs: 3, md: 5 }, mb: 5, textAlign: 'center'
        }}>
          <SchoolIcon sx={{ fontSize: 48, color: C.gold, mb: 2 }} />
          <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: '#fff', fontSize: { xs: '2.2rem', md: '3rem' }, mb: 1 }}>
            School Onboarding
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 500, mx: 'auto' }}>
            Link your account to a school to start managing communications and orders.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Stepper */}
        <Card elevation={0} sx={{ borderRadius: '20px', border: `1px solid ${C.border}`, mb: 5, p: 3 }}>
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Choose Option</StepLabel>
            </Step>
            <Step>
              <StepLabel>School Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Confirm & Wait</StepLabel>
            </Step>
          </Stepper>

          {/* STEP 0: Choose between NEW_SCHOOL or LINK_EXISTING_SCHOOL */}
          {step === 0 && (
            <Box>
              <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 3 }}>
                What would you like to do?
              </Typography>

              <RadioGroup value={choice} onChange={(e) => setChoice(e.target.value)}>
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    value="NEW_SCHOOL"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography fontWeight={700}>Create a New School</Typography>
                        <Typography variant="body2" color={C.stone}>
                          Request to add a school that isn't yet in our system
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    value="LINK_EXISTING_SCHOOL"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography fontWeight={700}>Link to Existing School</Typography>
                        <Typography variant="body2" color={C.stone}>
                          Link your account to a school already in our system
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button onClick={() => navigate('/')} sx={{ color: C.stone }}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleChoiceNext}
                  disabled={!choice}
                  sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 1: NEW_SCHOOL - Form */}
          {step === 1 && choice === 'NEW_SCHOOL' && (
            <Box>
              <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 3 }}>
                School Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <TextField
                  label="School Name"
                  value={newSchoolForm.schoolName}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, schoolName: e.target.value })}
                  placeholder="e.g. St. Johns Primary School"
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  value={newSchoolForm.phoneNumber}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, phoneNumber: e.target.value })}
                  placeholder="e.g. +27 21 123 4567"
                  fullWidth
                />
                <TextField
                  label="Province"
                  value={newSchoolForm.province}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, province: e.target.value })}
                  placeholder="e.g. Western Cape"
                  fullWidth
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setStep(0)} sx={{ color: C.stone }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNewSchoolSubmit}
                  disabled={submitting}
                  sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} /> : null}
                  Submit Request
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 1: LINK_EXISTING_SCHOOL - Schools List */}
          {step === 1 && choice === 'LINK_EXISTING_SCHOOL' && (
            <Box>
              <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 3 }}>
                Select a School
              </Typography>

              {schoolsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : availableSchools.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No schools available to link to. Please request to create a new school instead.
                </Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  {availableSchools.map(school => (
                    <Card
                      key={school.id}
                      elevation={selectedSchool?.id === school.id ? 2 : 0}
                      onClick={() => setSelectedSchool(school)}
                      sx={{
                        borderRadius: '12px',
                        border: `2px solid ${selectedSchool?.id === school.id ? C.forest : C.border}`,
                        p: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: selectedSchool?.id === school.id ? C.goldPale : '#fff',
                        '&:hover': { boxShadow: '0 4px 12px rgba(27,58,45,0.1)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography fontWeight={700} color={C.ink}>{school.name}</Typography>
                          <Typography variant="body2" color={C.stone} sx={{ mt: 0.5 }}>
                            {school.district}, {school.province}
                          </Typography>
                          <Typography variant="caption" color={C.stone} sx={{ mt: 1, display: 'block' }}>
                            📞 {school.phone}
                          </Typography>
                        </Box>
                        {selectedSchool?.id === school.id && (
                          <CheckCircleIcon sx={{ color: C.forest, fontSize: 24 }} />
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setStep(0)} sx={{ color: C.stone }}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLinkSchoolSubmit}
                  disabled={submitting || !selectedSchool}
                  sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}
                >
                  {submitting ? <CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} /> : null}
                  Submit Request
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 2: Confirmation & Status */}
          {step === 2 && (
            <Box>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: C.forest, mb: 2 }} />
                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 1 }}>
                  Request Submitted!
                </Typography>
                <Typography color={C.stone} sx={{ maxWidth: 400, mx: 'auto' }}>
                  A super admin will review your request shortly. You'll be notified once it's approved.
                  Check your request status below.
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 2, mt: 4 }}>
                Your Requests
              </Typography>

              {requestsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : requests.length === 0 ? (
                <Alert severity="info">No requests found</Alert>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: C.cream }}>
                        <TableCell sx={{ fontWeight: 700, color: C.ink }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.ink }}>Details</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.ink }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: C.ink }}>Submitted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map(req => {
                        const statusColor = getStatusColor(req.status);
                        return (
                          <TableRow key={req.id} sx={{ borderBottom: `1px solid ${C.border}` }}>
                            <TableCell sx={{ color: C.ink, fontWeight: 600 }}>
                              {req.requestType === 'NEW_SCHOOL' ? 'New School' : 'Link Existing'}
                            </TableCell>
                            <TableCell sx={{ color: C.stone }}>
                              {req.requestType === 'NEW_SCHOOL'
                                ? `${req.schoolName} (${req.province})`
                                : `School ID: ${req.linkedSchoolId}`}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={req.status}
                                size="small"
                                sx={{
                                  background: statusColor.bg,
                                  color: statusColor.color,
                                  fontWeight: 700,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: C.stone, fontSize: '0.85rem' }}>
                              {new Date(req.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {requests.some(r => r.status === 'APPROVED') && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/school/dashboard')}
                    sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 4 }}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}