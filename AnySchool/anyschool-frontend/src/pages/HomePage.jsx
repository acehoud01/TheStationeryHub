import React, { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, Chip, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VerifiedIcon from '@mui/icons-material/Verified';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';

const C = {
  forest:'#1B3A2D', forestMid:'#2D5C47', forestLight:'#3D7A60',
  gold:'#C8A45C', goldLight:'#E2C07A', goldPale:'#F5EDD8',
  cream:'#FAF7F2', parchment:'#F0EBE0', border:'#E5DED4',
  ink:'#1C1814', stone:'#8C8070',
};

const stat = (value, label) => (
  <Box sx={{ textAlign:'center' }}>
    <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, fontSize:{xs:'2.2rem',md:'2.8rem'}, color:C.gold, lineHeight:1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.7)', mt:0.5, fontWeight:500 }}>{label}</Typography>
  </Box>
);

const feature = (icon, title, desc) => (
  <Box sx={{ display:'flex', gap:2, alignItems:'flex-start' }}>
    <Box sx={{
      width:44, height:44, borderRadius:'12px', flexShrink:0,
      background:`linear-gradient(135deg, ${C.goldPale} 0%, ${C.parchment} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
    }}>{icon}</Box>
    <Box>
      <Typography variant="h6" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, color:C.ink, mb:0.5 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color:C.stone, lineHeight:1.7 }}>{desc}</Typography>
    </Box>
  </Box>
);

const roleCard = (Icon, color, bg, role, desc, path) => (
  <Box
    component={Link} to={path}
    sx={{
      display:'block', textDecoration:'none', p:3.5,
      background:bg, borderRadius:'20px', border:`1px solid ${C.border}`,
      transition:'all 0.28s cubic-bezier(0.4,0,0.2,1)',
      '&:hover':{ transform:'translateY(-5px)', boxShadow:`0 20px 48px rgba(27,58,45,0.14)`, borderColor:C.gold },
    }}
  >
    <Avatar sx={{ width:52, height:52, background:color, mb:2, borderRadius:'14px' }}>
      <Icon sx={{ color:'#fff', fontSize:26 }} />
    </Avatar>
    <Typography variant="h6" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:C.ink, mb:1 }}>{role}</Typography>
    <Typography variant="body2" sx={{ color:C.stone, lineHeight:1.7, mb:2 }}>{desc}</Typography>
    <Typography variant="body2" sx={{ color:C.forestLight, fontWeight:600, fontSize:'0.82rem', letterSpacing:'0.03em' }}>
      GET STARTED →
    </Typography>
  </Box>
);

export default function HomePage() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (user?.role === 'SCHOOL_ADMIN' && !user?.schoolId) {
      return <Navigate to="/school/onboarding" replace />;
    }
    const roleRoute = {
      PARENT: '/parent/dashboard',
      DONOR: '/donor/dashboard',
      SCHOOL_ADMIN: '/school/dashboard',
      PURCHASING_ADMIN: '/purchasing/dashboard',
      SUPER_ADMIN: '/admin',
    };
    return <Navigate to={roleRoute[user?.role] || '/'} replace />;
  }

  return (
    <Box sx={{ background:C.cream, minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── HERO ── */}
      <Box sx={{
        position:'relative', overflow:'hidden',
        background:`linear-gradient(160deg, ${C.forest} 0%, ${C.forestMid} 55%, ${C.forestLight} 100%)`,
        pt:{ xs:8, md:14 }, pb:{ xs:10, md:16 },
      }}>
        {/* Decorative circles */}
        <Box sx={{ position:'absolute', top:-80, right:-80, width:480, height:480, borderRadius:'50%',
          border:`1px solid rgba(200,164,92,0.15)`, pointerEvents:'none' }} />
        <Box sx={{ position:'absolute', top:-40, right:-40, width:360, height:360, borderRadius:'50%',
          border:`1px solid rgba(200,164,92,0.10)`, pointerEvents:'none' }} />
        <Box sx={{ position:'absolute', bottom:-120, left:-60, width:400, height:400, borderRadius:'50%',
          background:'rgba(200,164,92,0.04)', pointerEvents:'none' }} />

        <Container maxWidth="lg" sx={{ position:'relative', zIndex:1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip
                label="✦ Connecting communities through education"
                sx={{ background:'rgba(200,164,92,0.18)', color:C.gold, fontWeight:600,
                  fontSize:'0.78rem', letterSpacing:'0.04em', mb:3, border:`1px solid rgba(200,164,92,0.3)` }}
              />
              <Typography variant="h1" sx={{
                fontFamily:'"Cormorant Garamond",serif', fontWeight:700,
                fontSize:{ xs:'3rem', md:'4.5rem', lg:'5.2rem' },
                color:'#fff', lineHeight:1.08, mb:3,
              }}>
                School Supplies,
                <Box component="span" sx={{ color:C.gold, display:'block' }}>
                  Simplified.
                </Box>
              </Typography>
              <Typography sx={{ color:'rgba(255,255,255,0.75)', fontSize:{xs:'1.05rem',md:'1.2rem'}, lineHeight:1.8, mb:5, maxWidth:520 }}>
                AnySchool bridges the gap between families, schools and generous donors — making sure every child has the stationery they need to succeed.
              </Typography>
              <Box sx={{ display:'flex', gap:2, flexWrap:'wrap' }}>
                <Button component={Link} to="/register" variant="contained" size="large"
                  sx={{ background:`linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                    color:C.forest, fontWeight:700, px:4, py:1.5, fontSize:'1rem',
                    '&:hover':{ background:C.goldLight } }}>
                  Start Free →
                </Button>
                <Button component={Link} to="/schools" variant="outlined" size="large"
                  sx={{ borderColor:'rgba(255,255,255,0.4)', color:'#fff', px:4, py:1.5, fontSize:'1rem',
                    '&:hover':{ borderColor:'#fff', background:'rgba(255,255,255,0.08)' } }}>
                  Browse Schools
                </Button>
              </Box>
            </Grid>

            {/* Hero visual */}
            <Grid item xs={12} md={5} sx={{ display:{ xs:'none', md:'flex' }, justifyContent:'center' }}>
              <Box sx={{
                width:340, height:340,
                background:'rgba(255,255,255,0.06)',
                borderRadius:'32px', border:`1px solid rgba(200,164,92,0.25)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative', backdropFilter:'blur(8px)',
              }}>
                <SchoolIcon sx={{ fontSize:140, color:'rgba(200,164,92,0.35)' }} />
                {/* Floating badges */}
                {[
                  { top:20, right:-20, label:'📚 247 Schools', bg:'rgba(255,255,255,0.12)' },
                  { bottom:40, left:-30, label:'🎓 12k+ Students', bg:'rgba(200,164,92,0.18)' },
                  { top:100, left:-40, label:'❤️ 890 Donors', bg:'rgba(255,255,255,0.10)' },
                ].map((b,i) => (
                  <Box key={i} sx={{
                    position:'absolute', top:b.top, bottom:b.bottom, left:b.left, right:b.right,
                    background:b.bg, backdropFilter:'blur(8px)', border:`1px solid rgba(200,164,92,0.2)`,
                    borderRadius:'12px', px:2, py:1,
                    animation:`float${i} 3s ease-in-out infinite`,
                  }}>
                    <Typography variant="caption" sx={{ color:'#fff', fontWeight:600, whiteSpace:'nowrap' }}>
                      {b.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Stats row */}
          <Grid container spacing={4} sx={{ mt:{ xs:6, md:8 }, pt:4, borderTop:`1px solid rgba(255,255,255,0.12)` }}>
            {[
              ['247+','Schools enrolled'],
              ['12,400+','Students supported'],
              ['890+','Active donors'],
              ['R 2.4M+','In donations'],
            ].map(([v,l]) => (
              <Grid item xs={6} md={3} key={l}>{stat(v,l)}</Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── WHO IT'S FOR ── */}
      <Container maxWidth="lg" sx={{ py:{xs:8,md:12} }}>
        <Box sx={{ textAlign:'center', mb:8 }}>
          <Chip label="✦ BUILT FOR EVERYONE" sx={{ background:C.goldPale, color:C.forest, fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.06em', mb:2 }} />
          <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, fontSize:{xs:'2.4rem',md:'3.4rem'}, color:C.ink, mb:2 }}>
            One platform, every role
          </Typography>
          <Typography variant="body1" sx={{ color:C.stone, maxWidth:500, mx:'auto', lineHeight:1.8 }}>
            Whether you're a parent, a school administrator or a generous donor — AnySchool has a home for you.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            {roleCard(FamilyRestroomIcon, C.forestMid, '#F0F9F4', 'Parent / Guardian',
              'Manage your children, track orders, and ensure your child always has what they need.', '/register')}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {roleCard(SchoolIcon, '#1D4ED8', '#EFF6FF', 'School Admin',
              'Oversee your school\'s stationery programme, approve students and monitor donations.', '/register')}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {roleCard(VolunteerActivismIcon, '#9333EA', '#FAF5FF', 'Donor',
              'Contribute directly to schools and see real impact in the communities you support.', '/register')}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {roleCard(AutoStoriesIcon, '#B45309', '#FFFBEB', 'Browse Catalog',
              'Explore hundreds of stationery items across all subjects and grade levels.', '/stationery')}
          </Grid>
        </Grid>
      </Container>

      {/* ── HOW IT WORKS ── */}
      <Box sx={{ background:C.parchment, py:{xs:8,md:12}, borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={5}>
              <Chip label="✦ SIMPLE PROCESS" sx={{ background:C.goldPale, color:C.forest, fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.06em', mb:2 }} />
              <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:600, fontSize:{xs:'2.4rem',md:'3.2rem'}, color:C.ink, mb:3 }}>
                How it works
              </Typography>
              <Box sx={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  ['1', 'Register & choose your role', 'Create a free account as a parent, school admin or donor in under 2 minutes.'],
                  ['2', 'Link to your school', 'Parents add their children and link to their school. Admins verify enrolment.'],
                  ['3', 'Order or donate', 'Browse the catalog, add to cart, and check out — or donate to any registered school.'],
                ].map(([n,t,d]) => (
                  <Box key={n} sx={{ display:'flex', gap:2.5 }}>
                    <Box sx={{ width:36, height:36, borderRadius:'50%', background:C.forest,
                      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:700, fontSize:'0.85rem', flexShrink:0, mt:0.25 }}>{n}</Box>
                    <Box>
                      <Typography fontWeight={700} color={C.ink} mb={0.5}>{t}</Typography>
                      <Typography variant="body2" color={C.stone} lineHeight={1.7}>{d}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2.5}>
                {[
                  [CheckCircleOutlineIcon, C.success, '#F0FDF4', 'Verified Schools', 'Every school is vetted before joining the platform.'],
                  [VerifiedIcon, '#1D4ED8', '#EFF6FF', 'Secure Payments', 'PCI-compliant checkout with full order tracking.'],
                  [TrendingUpIcon, '#9333EA', '#FAF5FF', 'Impact Reports', 'See exactly where every rand of your donation went.'],
                  [AutoStoriesIcon, C.forest, C.goldPale, 'Curated Catalog', 'Quality stationery approved and priced for SA schools.'],
                ].map(([Icon, iconColor, bg, title, desc]) => (
                  <Grid item xs={12} sm={6} key={title}>
                    <Box sx={{ p:3, background:bg, borderRadius:'16px', border:`1px solid ${C.border}`, height:'100%' }}>
                      <Avatar sx={{ background:iconColor, width:42, height:42, borderRadius:'12px', mb:2 }}>
                        <Icon sx={{ color:'#fff', fontSize:22 }} />
                      </Avatar>
                      <Typography fontWeight={700} color={C.ink} mb={0.75}>{title}</Typography>
                      <Typography variant="body2" color={C.stone} lineHeight={1.7}>{desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <Box sx={{ background:`linear-gradient(135deg, ${C.forest} 0%, ${C.forestMid} 100%)`, py:{xs:10,md:14} }}>
        <Container maxWidth="md" sx={{ textAlign:'center' }}>
          <Typography variant="h2" sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700,
            fontSize:{xs:'2.6rem',md:'3.8rem'}, color:'#fff', mb:3 }}>
            Ready to make a difference?
          </Typography>
          <Typography sx={{ color:'rgba(255,255,255,0.72)', fontSize:'1.1rem', mb:5, lineHeight:1.8 }}>
            Join thousands of South African families, schools and donors building better educational futures together.
          </Typography>
          <Box sx={{ display:'flex', gap:2, justifyContent:'center', flexWrap:'wrap' }}>
            <Button component={Link} to="/register" variant="contained" size="large"
              sx={{ background:`linear-gradient(135deg, ${C.gold} 0%, ${C.goldLight} 100%)`,
                color:C.forest, fontWeight:700, px:5, py:1.75, fontSize:'1.05rem' }}>
              Create Free Account
            </Button>
            <Button component={Link} to="/login" variant="outlined" size="large"
              sx={{ borderColor:'rgba(255,255,255,0.35)', color:'#fff', px:5, py:1.75, fontSize:'1.05rem',
                '&:hover':{ borderColor:'#fff', background:'rgba(255,255,255,0.08)' } }}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ background:C.ink, py:5 }}>
        <Container maxWidth="lg">
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:2 }}>
            <Typography sx={{ fontFamily:'"Cormorant Garamond",serif', fontWeight:700, color:'rgba(255,255,255,0.85)', fontSize:'1.2rem' }}>
              AnySchool
            </Typography>
            <Typography variant="caption" sx={{ color:'rgba(255,255,255,0.35)' }}>
              © 2025 AnySchool · Building brighter futures, one pencil at a time.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
