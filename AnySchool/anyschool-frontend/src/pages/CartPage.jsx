import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Button, Chip, Avatar,
  CircularProgress, Alert, TextField, Autocomplete, MenuItem, Divider,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LockIcon from '@mui/icons-material/Lock';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const C = {
  forest: '#1B3A2D', forestMid: '#2D5C47', gold: '#C8A45C',
  goldPale: '#F5EDD8', cream: '#FAF7F2', parchment: '#F0EBE0',
  border: '#E5DED4', ink: '#1C1814', stone: '#8C8070',
};

const SA_PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape',
];

const dialogPaper = {
  borderRadius: '24px',
  border: `1px solid ${C.border}`,
  boxShadow: '0 24px 64px rgba(27,58,45,0.18)',
};

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const {
    cartItems, removeFromCart, updateQuantity,
    clearCart, getSubtotal, getVAT, getTotal,
  } = useCart();

  const [schools,             setSchools]             = useState([]);
  const [selectedSchool,      setSelectedSchool]      = useState('');
  const [selectedGrade,       setSelectedGrade]       = useState('');
  const [studentName,         setStudentName]         = useState('');
  const [grades,              setGrades]              = useState([]);
  const [loadingSchools,      setLoadingSchools]      = useState(true);
  const [checkoutLoading,     setCheckoutLoading]     = useState(false);
  const [error,               setError]               = useState('');
  const [success,             setSuccess]             = useState('');
  const [schoolSearchMode,    setSchoolSearchMode]    = useState('existing');
  const [requestedSchoolName, setRequestedSchoolName] = useState('');
  const [children,            setChildren]            = useState([]);
  const [selectedChild,       setSelectedChild]       = useState('');
  const [loadingChildren,     setLoadingChildren]     = useState(false);

  // Academic year and payment
  const [academicYear,        setAcademicYear]        = useState('2026');
  const [paymentType,         setPaymentType]         = useState('IMMEDIATE');
  const [debitOrderDay,       setDebitOrderDay]       = useState(15);

  // Add child dialog
  const [showAddChild,     setShowAddChild]     = useState(false);
  const [addingChild,      setAddingChild]      = useState(false);
  const [newChildData,     setNewChildData]     = useState({ name: '', grade: '', school: null });
  const [childDialogError, setChildDialogError] = useState('');

  // School request dialog
  const [showSchoolRequest,  setShowSchoolRequest]  = useState(false);
  const [submittingRequest,  setSubmittingRequest]  = useState(false);
  const [schoolRequestData,  setSchoolRequestData]  = useState({ schoolName: '', phoneNumber: '', province: '' });
  const [schoolRequestError, setSchoolRequestError] = useState('');

  const isDonor       = user?.role === 'DONOR';
  const isParent      = user?.role === 'PARENT';
  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN';
  const subtotal = getSubtotal ? getSubtotal() : 0;
  const vat      = getVAT      ? getVAT()      : 0;
  const total    = getTotal    ? getTotal()    : subtotal;
  const totalItems = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const schoolObj  = schools.find(s => s.id === selectedSchool) || null;

  // Calculate payment plan details
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const showPaymentPlan = academicYear && academicYear !== '';
  
  // Calculate months for payment plan
  const calculatePaymentPlanMonths = () => {
    if (!showPaymentPlan) return 0;
    const startMonth = currentMonth + 1; // Next month
    const endMonth = 11; // November
    if (startMonth > endMonth) return 0;
    return endMonth - startMonth + 1;
  };

  const paymentPlanMonths = calculatePaymentPlanMonths();
  const monthlyInstalment = paymentPlanMonths > 0 ? (total / paymentPlanMonths) : 0;

  // Calculate debit dates
  const getDebitDates = () => {
    if (!showPaymentPlan || paymentPlanMonths === 0) return { first: null, last: null };
    const year = currentYear; // Payments are made in current year
    const startMonth = currentMonth + 1;
    const endMonth = 11;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Handle last day of month (31)
    const getDay = (month) => {
      if (debitOrderDay === 31) {
        const daysInMonth = new Date(year, month, 0).getDate();
        return daysInMonth;
      }
      return debitOrderDay;
    };
    
    const first = `${getDay(startMonth)} ${monthNames[startMonth - 1]} ${year}`;
    const last = `${getDay(endMonth)} ${monthNames[endMonth - 1]} ${year}`;
    
    return { first, last };
  };

  const debitDates = getDebitDates();

  // Payment type defaults to PAYMENT_PLAN for any valid academic year
  useEffect(() => {
    if (academicYear && academicYear !== '') {
      setPaymentType('PAYMENT_PLAN');
    }
  }, [academicYear]);

  useEffect(() => { fetchSchools(); }, []);

  // For school admins, auto-select their school
  useEffect(() => { 
    if (isSchoolAdmin && user?.schoolId && schools.length > 0) {
      const adminSchool = schools.find(s => s.id === user.schoolId);
      if (adminSchool) {
        setSelectedSchool(user.schoolId);
        if (adminSchool.grades) {
          setGrades(adminSchool.grades.split(',').map(g => g.trim()).filter(Boolean));
        }
      }
    }
  }, [isSchoolAdmin, user?.schoolId, schools]);

  useEffect(() => { if (isAuthenticated && isParent) fetchChildren(); }, [isAuthenticated, isParent]);
  useEffect(() => {
    if (selectedSchool) {
      const school = schools.find(s => s.id === selectedSchool);
      if (school?.grades) setGrades(school.grades.split(',').map(g => g.trim()).filter(Boolean));
      else setGrades([]);
      setSelectedGrade('');
    }
  }, [selectedSchool, schools]);

  const fetchSchools = async () => {
    setLoadingSchools(true);
    try {
      const res = await axios.get(API_ENDPOINTS.SCHOOLS.LIST);
      if (res.data.success) setSchools(res.data.schools || []);
    } catch (_) {}
    finally { setLoadingSchools(false); }
  };

  const fetchChildren = async () => {
    setLoadingChildren(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.CHILDREN.LIST, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        const kids = res.data.children || [];
        setChildren(kids);
        if (kids.length === 1) autoSelectChild(kids[0], kids);
      }
    } catch (_) {}
    finally { setLoadingChildren(false); }
  };

  const autoSelectChild = (child, list = children) => {
    setSelectedChild(child.id);
    setStudentName(child.name);
    setSelectedGrade(child.grade);
    if (child.school) { setSelectedSchool(child.school.id); setSchoolSearchMode('existing'); }
    else if (child.requestedSchoolName) { setRequestedSchoolName(child.requestedSchoolName); setSchoolSearchMode('requested'); }
  };

  const handleChildSelect = (childId) => {
    setSelectedChild(childId);
    if (!childId) return;
    const child = children.find(c => c.id === childId);
    if (child) autoSelectChild(child);
  };

  const handleAddChild = async () => {
    setChildDialogError('');
    if (!newChildData.name.trim()) { setChildDialogError('Child name is required'); return; }
    if (!newChildData.grade.trim()) { setChildDialogError('Grade is required'); return; }
    if (!newChildData.school) { setChildDialogError('Please select a school'); return; }
    setAddingChild(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        API_ENDPOINTS.CHILDREN.ADD,
        { name: newChildData.name.trim(), grade: newChildData.grade.trim(), schoolId: newChildData.school.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const nc = res.data.child;
        setChildren(prev => [...prev, nc]);
        autoSelectChild(nc);
        setShowAddChild(false);
        setNewChildData({ name: '', grade: '', school: null });
        setSuccess('Child added! Order details pre-filled.');
      }
    } catch (e) { setChildDialogError(e.response?.data?.message || 'Failed to add child.'); }
    finally { setAddingChild(false); }
  };

  const handleSchoolRequest = async () => {
    setSchoolRequestError('');
    if (!schoolRequestData.schoolName.trim()) { setSchoolRequestError('School name is required'); return; }
    if (!schoolRequestData.phoneNumber.trim()) { setSchoolRequestError('Phone number is required'); return; }
    if (!schoolRequestData.province) { setSchoolRequestError('Please select a province'); return; }
    setSubmittingRequest(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_ENDPOINTS.SCHOOL_REQUESTS.SUBMIT, schoolRequestData, { headers: { Authorization: `Bearer ${token}` } });
      setRequestedSchoolName(schoolRequestData.schoolName.trim());
      setSchoolSearchMode('requested');
      if (newChildData.grade.trim()) setSelectedGrade(newChildData.grade.trim());
      if (newChildData.name.trim())  setStudentName(newChildData.name.trim());
      setShowSchoolRequest(false);
      setShowAddChild(false);
      setSchoolRequestData({ schoolName: '', phoneNumber: '', province: '' });
      setNewChildData({ name: '', grade: '', school: null });
      setSuccess(`School request for "${schoolRequestData.schoolName.trim()}" submitted!`);
    } catch (e) { setSchoolRequestError(e.response?.data?.message || 'Failed to submit request.'); }
    finally { setSubmittingRequest(false); }
  };

  const handleCheckout = async () => {
    setError(''); setSuccess('');
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedSchool && !requestedSchoolName.trim()) { setError('Please select or enter a school name'); return; }
    // Student details only required for parents/donors, not school admins
    if (!isDonor && !isSchoolAdmin) {
      if (!selectedGrade) { setError('Please enter the grade'); return; }
      if (!studentName.trim()) { setError('Please enter the student name'); return; }
    }
    if (cartItems.length === 0) { setError('Your cart is empty'); return; }
    if (!academicYear) { setError('Please select an academic year'); return; }
    if (showPaymentPlan && paymentType === 'PAYMENT_PLAN' && !debitOrderDay) { 
      setError('Please select a debit order day'); 
      return; 
    }
    
    setCheckoutLoading(true);
    try {
      const orderData = {
        orderType: isDonor ? 'DONATION' : 'PURCHASE',
        items: cartItems.map(i => ({ stationeryId: i.id, quantity: i.quantity })),
        academicYear: academicYear,
        paymentType: paymentType,
      };
      if (paymentType === 'PAYMENT_PLAN') {
        orderData.debitOrderDay = debitOrderDay;
      }
      if (selectedSchool) orderData.schoolId = selectedSchool;
      else if (requestedSchoolName.trim()) orderData.requestedSchoolName = requestedSchoolName.trim();
      if (!isDonor && selectedChild) orderData.childId = selectedChild;
      // Only add student details for parents, not school admins
      if (!isDonor && !isSchoolAdmin) { 
        orderData.studentGrade = selectedGrade.trim(); 
        orderData.studentName = studentName.trim(); 
      }
      const token = localStorage.getItem('token');
      const res = await axios.post(API_ENDPOINTS.ORDERS.CREATE, orderData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.data.success) {
        const orderId = res.data.order.id;
        setSuccess(isDonor ? `Donation #${orderId} submitted! Thank you!` : `Order #${orderId} created!`);
        clearCart();
        setSelectedSchool(''); setSelectedGrade(''); setStudentName(''); setSelectedChild(''); setRequestedSchoolName('');
        setTimeout(() => navigate(`/payment/${orderId}`), 1500);
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to create order. Please try again.'); }
    finally { setCheckoutLoading(false); }
  };

  // ── EMPTY STATE ─────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && !success) return (
    <Box sx={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 420 }}>
        <Box sx={{ width: 96, height: 96, borderRadius: '50%', background: C.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, border: `2px solid ${C.border}` }}>
          <ShoppingCartIcon sx={{ fontSize: 46, color: C.border }} />
        </Box>
        <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 2 }}>
          Your cart is empty
        </Typography>
        <Typography sx={{ color: C.stone, mb: 4, lineHeight: 1.8 }}>
          Browse our catalog to find stationery for your children's school year.
        </Typography>
        <Button variant="contained" component={Link} to="/stationery" startIcon={<AutoStoriesIcon />} size="large"
          sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
          Browse Catalog
        </Button>
      </Box>
    </Box>
  );

  // ── MAIN CART ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ background: C.cream, minHeight: '100vh', pt: 5, pb: 12 }}>
      <Container maxWidth="lg">

        <Box sx={{ mb: 5 }}>
          <Chip label={isDonor ? '✦ DONATION CART' : '✦ MY CART'}
            sx={{ background: C.goldPale, color: C.forest, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', mb: 2 }} />
          <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, fontSize: { xs: '2.2rem', md: '3rem' } }}>
            {isDonor ? 'Complete Donation' : 'Review & Checkout'}
          </Typography>
          <Typography sx={{ color: C.stone, mt: 0.5 }}>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</Typography>
        </Box>

        {error   && <Alert severity="error"   sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        <Grid container spacing={4}>

          {/* LEFT COLUMN */}
          <Grid item xs={12} md={7}>

            {/* Cart items card */}
            <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3, mb: 3, boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink }}>Cart Items</Typography>
                <Button size="small" onClick={clearCart} sx={{ color: '#EF4444', fontSize: '0.78rem', '&:hover': { background: '#FEF2F2' } }}>
                  Clear all
                </Button>
              </Box>
              <Box>
                {cartItems.map((item, i) => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, borderBottom: i < cartItems.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <Avatar sx={{ width: 48, height: 48, borderRadius: '12px', background: C.parchment, flexShrink: 0 }}>
                      <AutoStoriesIcon sx={{ color: C.stone }} />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} color={C.ink} noWrap>{item.name}</Typography>
                      <Typography variant="caption" color={C.stone}>R {(item.price || 0).toFixed(2)} each</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        sx={{ borderRadius: 0, px: 1, '&:hover': { background: C.parchment } }}>
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: '0.9rem', lineHeight: '32px' }}>
                        {item.quantity || 1}
                      </Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        sx={{ borderRadius: 0, px: 1, '&:hover': { background: C.parchment } }}>
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    <Typography fontWeight={700} color={C.forest} sx={{ minWidth: 76, textAlign: 'right' }}>
                      R {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                    <IconButton size="small" onClick={() => removeFromCart(item.id)}
                      sx={{ color: '#EF4444', opacity: 0.6, '&:hover': { opacity: 1, background: '#FEF2F2' } }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* School selector card - Hidden for school admins */}
            {!isSchoolAdmin && (
              <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3, mb: 3, boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <SchoolIcon sx={{ color: C.forest }} />
                  <Typography variant="h6" fontWeight={700} color={C.ink}>
                    {isDonor ? 'Donate to which school?' : 'Delivery School'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                  {[['existing', 'Search schools'], ['requested', 'Not listed']].map(([mode, label]) => (
                    <Chip key={mode} label={label} onClick={() => { setSchoolSearchMode(mode); if (mode === 'existing') setRequestedSchoolName(''); else setSelectedSchool(''); }}
                      sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: schoolSearchMode === mode ? C.forest : '#fff', color: schoolSearchMode === mode ? '#fff' : C.stone, border: `1px solid ${schoolSearchMode === mode ? C.forest : C.border}`, '&:hover': { background: schoolSearchMode === mode ? C.forestMid : C.parchment } }} />
                  ))}
                </Box>
                {schoolSearchMode === 'existing' ? (
                  <Autocomplete options={schools} disabled={loadingSchools}
                    getOptionLabel={o => `${o.name}${o.district ? ' – ' + o.district : ''}${o.province ? ', ' + o.province : ''}`}
                    value={schoolObj}
                    onChange={(_, v) => setSelectedSchool(v ? v.id : '')}
                    renderInput={params => <TextField {...params} label="Search schools" helperText="Start typing the school name, district or province" />}
                    renderOption={(props, o) => (
                      <Box component="li" {...props}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {[o.district, o.province].filter(Boolean).join(', ')}{o.grades ? ` · Grades: ${o.grades}` : ''}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                ) : (
                  <TextField fullWidth label="School name" value={requestedSchoolName}
                    onChange={e => setRequestedSchoolName(e.target.value)}
                    placeholder="e.g. Sunridge Primary School"
                    helperText="An admin will register this school. Your order will still be processed." />
                )}
              </Box>
            )}

            {/* School display for school admins (greyed out, non-editable) */}
            {isSchoolAdmin && (
              <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3, mb: 3, opacity: 0.7, boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <SchoolIcon sx={{ color: C.stone }} />
                  <Typography variant="h6" fontWeight={700} color={C.stone}>
                    Delivery School
                  </Typography>
                </Box>
                <TextField 
                  fullWidth 
                  value={schoolObj?.name || 'Loading...'} 
                  disabled 
                  label="School"
                  helperText="Your linked school (cannot be changed)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: '#F5F5F5',
                    }
                  }}
                />
              </Box>
            )}

            {/* Student details - Hidden for school admins (they order for school, not specific students) */}
            {!isDonor && !isSchoolAdmin && (
              <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3, boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PersonIcon sx={{ color: C.forest }} />
                    <Typography variant="h6" fontWeight={700} color={C.ink}>Student Details</Typography>
                  </Box>
                  {isParent && (
                    <Button size="small" startIcon={<PersonAddIcon sx={{ fontSize: 16 }} />}
                      onClick={() => { setChildDialogError(''); setShowAddChild(true); }}
                      sx={{ color: C.forestMid, fontWeight: 600, fontSize: '0.8rem' }}>
                      Add child
                    </Button>
                  )}
                </Box>

                {isParent && children.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5, display: 'block' }}>
                      Order for:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      {children.map(child => (
                        <Box key={child.id} onClick={() => handleChildSelect(child.id)} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: '12px', cursor: 'pointer', border: `2px solid ${selectedChild === child.id ? C.forest : C.border}`, background: selectedChild === child.id ? '#F0F9F4' : '#fff', transition: 'all 0.2s', '&:hover': { borderColor: C.forest } }}>
                          <Avatar sx={{ width: 32, height: 32, background: C.forestMid, fontSize: '0.75rem', fontWeight: 700 }}>
                            {child.name?.[0]?.toUpperCase() || 'C'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color={C.ink}>{child.name}</Typography>
                            <Typography variant="caption" color={C.stone}>Grade {child.grade}</Typography>
                          </Box>
                          {selectedChild === child.id && <CheckCircleIcon sx={{ color: C.forest, fontSize: 18 }} />}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {isParent && !loadingChildren && children.length === 0 && (
                  <Alert severity="info" icon={<ChildCareIcon />} sx={{ mb: 3, borderRadius: '12px' }}>
                    No children added yet. Click <strong>Add child</strong> above to link a child to this order.
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    <TextField fullWidth label="Student Name" value={studentName} onChange={e => setStudentName(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    {grades.length > 0 ? (
                      <TextField select fullWidth label="Grade" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} required>
                        <MenuItem value="" disabled>Select grade</MenuItem>
                        {grades.map(g => <MenuItem key={g} value={g}>Grade {g}</MenuItem>)}
                      </TextField>
                    ) : (
                      <TextField fullWidth label="Grade" value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} placeholder="e.g. 5" required />
                    )}
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Academic Year & Payment Plan */}
            <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3, mb: 3, boxShadow: '0 2px 12px rgba(27,58,45,0.06)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PaymentIcon sx={{ color: C.forest }} />
                <Typography variant="h6" fontWeight={700} color={C.ink}>Academic Year & Payment</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ color: C.stone, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5, display: 'block' }}>
                  Select Academic Year *
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {[currentYear.toString(), (currentYear + 1).toString()].map(year => (
                    <Box key={year} onClick={() => setAcademicYear(year)} sx={{ flex: 1, p: 2.5, borderRadius: '12px', cursor: 'pointer', border: `2px solid ${academicYear === year ? C.forest : C.border}`, background: academicYear === year ? '#F0F9F4' : '#fff', transition: 'all 0.2s', textAlign: 'center', '&:hover': { borderColor: C.forest } }}>
                      <Typography variant="h6" fontWeight={700} color={C.ink}>{year}</Typography>
                      <Typography variant="caption" color={C.stone}>
                        {parseInt(year) === currentYear ? 'Current Year' : 'Next Year'}
                      </Typography>
                      {academicYear === year && <CheckCircleIcon sx={{ color: C.forest, fontSize: 18, mt: 0.5 }} />}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Delivery Information */}
              {academicYear && (
                <Alert severity="info" sx={{ borderRadius: '12px', mb: 2.5 }}>
                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                    {parseInt(academicYear) === currentYear ? '📦 Delivery Timeline' : '📅 Delivery Schedule'}
                  </Typography>
                  <Typography variant="body2">
                    {parseInt(academicYear) === currentYear 
                      ? 'Delivery: 5-10 working days after payment confirmation.'
                      : 'Estimated delivery: First week of January ' + academicYear + ' (To be confirmed).'}
                  </Typography>
                </Alert>
              )}

              {/* Payment Method Selector */}
              {academicYear && paymentPlanMonths > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" fontWeight={600} color={C.ink} mb={1}>
                    💰 Payment Method
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {['IMMEDIATE', 'PAYMENT_PLAN'].map(type => (
                      <Box 
                        key={type} 
                        onClick={() => setPaymentType(type)} 
                        sx={{ 
                          flex: 1, 
                          p: 2, 
                          borderRadius: '12px', 
                          cursor: 'pointer', 
                          border: `2px solid ${paymentType === type ? C.forest : C.border}`, 
                          background: paymentType === type ? '#F0F9F4' : '#fff', 
                          transition: 'all 0.2s', 
                          textAlign: 'center',
                          '&:hover': { borderColor: C.forest } 
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} color={C.ink}>
                          {type === 'IMMEDIATE' ? '🔵 Pay Now' : '📅 Payment Plan'}
                        </Typography>
                        <Typography variant="caption" color={C.stone}>
                          {type === 'IMMEDIATE' ? 'Full amount upfront' : `${paymentPlanMonths} monthly instalments`}
                        </Typography>
                        {paymentType === type && <CheckCircleIcon sx={{ color: C.forest, fontSize: 16, mt: 0.5 }} />}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Payment Plan */}
              {showPaymentPlan && paymentPlanMonths > 0 && paymentType === 'PAYMENT_PLAN' && (
                <Box>
                  <Alert severity="success" icon={<AccountBalanceIcon />} sx={{ borderRadius: '12px', mb: 2.5 }}>
                    <Typography variant="body2" fontWeight={600} mb={0.5}>💳 Payment Plan Available</Typography>
                    <Typography variant="body2">
                      Spread your payment over {paymentPlanMonths} months from {new Date(parseInt(academicYear), currentMonth).toLocaleString('default', { month: 'long' })} to November {academicYear}.
                    </Typography>
                  </Alert>

                  <Box sx={{ p: 2.5, background: C.parchment, borderRadius: '12px', mb: 2.5 }}>
                    <Typography variant="body2" fontWeight={600} color={C.ink} mb={1}>
                      Monthly Instalment
                    </Typography>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, fontSize: '1.8rem', color: C.forest, mb: 1 }}>
                      R {monthlyInstalment.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color={C.stone}>
                      Total: R {total.toFixed(2)} ÷ {paymentPlanMonths} months
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <TextField select fullWidth label="Debit Order Date" value={debitOrderDay}
                      onChange={e => setDebitOrderDay(parseInt(e.target.value))} required
                      helperText="Choose the day of month for debit orders">
                      {[1, 15, 20, 25, 26, 27, 28].map(day => (
                        <MenuItem key={day} value={day}>{day === 1 ? '1st' : `${day}th`} of each month</MenuItem>
                      ))}
                      <MenuItem key={31} value={31}>Last day of each month</MenuItem>
                    </TextField>
                  </Box>

                  {debitDates.first && debitDates.last && (
                    <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #F0F9F4 0%, #E6F7ED 100%)', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                      <Typography variant="body2" color={C.ink} mb={1} sx={{ fontWeight: 600 }}>
                        💰 Payment Schedule
                      </Typography>
                      <Typography variant="body2" color={C.stone} mb={0.5} sx={{ fontSize: '0.95rem' }}>
                        <strong>Monthly Amount:</strong> R {monthlyInstalment.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color={C.stone} mb={0.5} sx={{ fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        <strong>First debit order:</strong> {debitDates.first}
                      </Typography>
                      <Typography variant="body2" color={C.stone} mb={1.5} sx={{ fontSize: '0.95rem', fontFamily: '"Inter", sans-serif' }}>
                        <strong>Last debit order:</strong> {debitDates.last}
                      </Typography>
                      <Chip label="Awaiting Final Payment" size="small" 
                        sx={{ background: C.gold, color: C.forest, fontWeight: 600, fontSize: '0.7rem' }} />
                    </Box>
                  )}
                </Box>
              )}

              {showPaymentPlan && paymentPlanMonths === 0 && (
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                  <Typography variant="body2">
                    Payment plan not available - order placed too late in the year. Please choose current year for immediate payment.
                  </Typography>
                </Alert>
              )}
            </Box>

            {isDonor && (
              <Box sx={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #EFF6FF 100%)', borderRadius: '18px', border: '1px solid #DDD6FE', p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <VolunteerActivismIcon sx={{ color: '#7E22CE', fontSize: 32, flexShrink: 0 }} />
                  <Box>
                    <Typography fontWeight={700} color={C.ink} mb={0.5}>You're donating these items 🎉</Typography>
                    <Typography variant="body2" color={C.stone} lineHeight={1.7}>
                      Items will be sent directly to the selected school. Students and teachers thank you!
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Grid>

          {/* RIGHT COLUMN — ORDER SUMMARY */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              <Box sx={{ background: '#fff', borderRadius: '20px', border: `1px solid ${C.border}`, p: 3.5, boxShadow: '0 4px 24px rgba(27,58,45,0.10)' }}>
                <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink, mb: 3 }}>
                  Order Summary
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  {cartItems.map(item => (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <Typography variant="body2" color={C.stone} sx={{ flex: 1, mr: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name} ×{item.quantity || 1}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color={C.ink} sx={{ flexShrink: 0 }}>
                        R {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color={C.stone}>Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600} color={C.ink}>R {subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Typography variant="body2" color={C.stone}>VAT (15%)</Typography>
                  <Typography variant="body2" fontWeight={600} color={C.ink}>R {vat.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ borderColor: C.border, mb: 2.5 }} />

                {(schoolObj || requestedSchoolName) && (
                  <Box sx={{ p: 2, background: C.parchment, borderRadius: '12px', mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SchoolIcon sx={{ color: C.forestMid, fontSize: 20, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} color={C.ink} noWrap>
                        {schoolObj ? schoolObj.name : requestedSchoolName}
                      </Typography>
                      {schoolObj && (
                        <Typography variant="caption" color={C.stone}>
                          {[schoolObj.district, schoolObj.province].filter(Boolean).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3.5 }}>
                  <Typography fontWeight={700} color={C.ink}>Total (incl. VAT)</Typography>
                  <Typography sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, fontSize: '2rem', color: C.forest }}>
                    R {total.toFixed(2)}
                  </Typography>
                </Box>

                <Button variant="contained" size="large" fullWidth onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  endIcon={checkoutLoading ? null : <ArrowForwardIcon />}
                  sx={{ py: 1.75, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', background: isDonor ? 'linear-gradient(135deg, #7E22CE 0%, #A855F7 100%)' : `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)` }}>
                  {checkoutLoading
                    ? <><CircularProgress size={20} sx={{ mr: 1, color: 'inherit' }} /> Processing…</>
                    : isDonor ? 'Confirm Donation' : 'Proceed to Payment'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.75 }}>
                  <LockIcon sx={{ fontSize: 13, color: C.stone }} />
                  <Typography variant="caption" color={C.stone}>Secured by 256-bit SSL encryption</Typography>
                </Box>

                <Button component={Link} to="/stationery" fullWidth variant="text"
                  sx={{ mt: 1, color: C.stone, fontSize: '0.82rem' }}>
                  ← Continue shopping
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* DIALOG: Add Child */}
      <Dialog open={showAddChild} onClose={() => setShowAddChild(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, borderRadius: '12px' }}>
              <ChildCareIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink }}>Add a Child</Typography>
              <Typography variant="caption" color={C.stone}>Link a child to this order</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {childDialogError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setChildDialogError('')}>{childDialogError}</Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Child's Full Name" fullWidth required value={newChildData.name}
              onChange={e => setNewChildData(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Grade" fullWidth required value={newChildData.grade}
              onChange={e => setNewChildData(p => ({ ...p, grade: e.target.value }))} placeholder="e.g. 5" />
            <Autocomplete options={schools}
              getOptionLabel={o => `${o.name}${o.district ? ' – ' + o.district : ''}`}
              value={newChildData.school}
              onChange={(_, v) => setNewChildData(p => ({ ...p, school: v }))}
              renderInput={params => <TextField {...params} label="School *" />}
              renderOption={(props, o) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{[o.district, o.province].filter(Boolean).join(', ')}</Typography>
                  </Box>
                </Box>
              )}
              noOptionsText={
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="body2" color={C.stone} mb={1}>School not found</Typography>
                  <Button size="small" variant="outlined"
                    onClick={() => { setShowAddChild(false); setSchoolRequestError(''); setShowSchoolRequest(true); }}
                    sx={{ borderColor: C.border, color: C.ink, borderRadius: '8px' }}>
                    Request new school
                  </Button>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setShowAddChild(false)} sx={{ color: C.stone }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddChild} disabled={addingChild}
            sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 3 }}>
            {addingChild ? <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} /> : null}
            Add Child
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG: School Request */}
      <Dialog open={showSchoolRequest} onClose={() => setShowSchoolRequest(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaper }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, background: `linear-gradient(135deg, ${C.gold} 0%, #E2C07A 100%)`, borderRadius: '12px' }}>
              <SchoolIcon sx={{ color: C.forest, fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond",serif', fontWeight: 700, color: C.ink }}>Request New School</Typography>
              <Typography variant="caption" color={C.stone}>We'll register it and link your order</Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {schoolRequestError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setSchoolRequestError('')}>{schoolRequestError}</Alert>
          )}
          <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px' }}>
            Your order will be processed immediately. The school will be verified by an admin.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="School Name *" fullWidth required value={schoolRequestData.schoolName}
              onChange={e => setSchoolRequestData(p => ({ ...p, schoolName: e.target.value }))}
              placeholder="e.g. Sunridge Primary School" />
            <TextField label="Your Phone Number *" fullWidth required value={schoolRequestData.phoneNumber}
              onChange={e => setSchoolRequestData(p => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="+27 XX XXX XXXX" />
            <TextField select fullWidth label="Province *" required value={schoolRequestData.province}
              onChange={e => setSchoolRequestData(p => ({ ...p, province: e.target.value }))}>
              <MenuItem value="" disabled>Select province</MenuItem>
              {SA_PROVINCES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setShowSchoolRequest(false)} sx={{ color: C.stone }}>Back</Button>
          <Button variant="contained" onClick={handleSchoolRequest} disabled={submittingRequest}
            sx={{ background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, px: 3 }}>
            {submittingRequest ? <CircularProgress size={18} sx={{ mr: 1, color: 'inherit' }} /> : null}
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
