import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';

const LandingPage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleBackToMainMenu = () => {
    // Go back to TheStationeryHub main landing page
    window.location.href = 'http://localhost:3000';
  };

  const handleAnySchool = () => {
    navigate('/home');
  };

  const handleAnyOffice = () => {
    // Navigate to AnyOffice frontend (runs on port 3001)
    window.location.href = 'http://localhost:3001';
  };

  return (
    <Box>
      {/* Main Content */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.7) 50%, rgba(51, 65, 85, 0.75) 100%), url("/pexels-kindelmedia-7054754.jpg") center/cover',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
            top: '-150px',
            right: '-100px',
            borderRadius: '50%',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            bottom: '-120px',
            left: '-150px',
            borderRadius: '50%',
            pointerEvents: 'none',
          },
        }}
      >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
          {/* Main Heading */}
          <Typography
            sx={{
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontWeight: 700,
              mb: 2,
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '-0.5px',
              fontFamily: `'Poppins', sans-serif`,
            }}
          >
            TheStationeryHub
          </Typography>

          {/* Tagline */}
          <Typography
            sx={{
              fontSize: { xs: '1.1rem', md: '1.4rem' },
              color: '#e0f2fe',
              fontFamily: `'Poppins', sans-serif`,
              fontWeight: 400,
              letterSpacing: '0.3px',
              mb: 8,
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.8,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            Connecting schools, families, and businesses with essential supplies through intelligent, transparent procurement solutions.
          </Typography>

          {/* Mission Statement */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              p: { xs: 4, md: 6 },
              mb: 10,
              maxWidth: '800px',
              mx: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                color: '#f0f9ff',
                lineHeight: 1.8,
                fontFamily: `'Poppins', sans-serif`,
                fontWeight: 300,
              }}
            >
              Our mission is to transform how educational institutions and businesses source supplies. 
              We believe that efficient procurement empowers schools to focus on education, families to manage budgets effectively, 
              and businesses to scale sustainably. Through our unified platform, we've eliminated complexity and introduced transparency, 
              affordability, and reliability at every step.
            </Typography>
          </Box>

          {/* Two Platform Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 3, md: 4 },
              mb: 10,
            }}
          >
            {/* AnySchool Card */}
            <Box
              onClick={handleAnySchool}
              onMouseEnter={() => setHoveredCard('school')}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                p: { xs: 4, md: 5 },
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: hoveredCard === 'school' ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'school'
                  ? '0 25px 50px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.15)'
                  : '0 8px 24px rgba(0, 0, 0, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.6s',
                },
                '&:hover::before': {
                  left: '100%',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.8rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                  fontFamily: `'Poppins', sans-serif`,
                }}
              >
                AnySchool
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.95rem',
                  color: '#e0f2fe',
                  lineHeight: 1.7,
                  mb: 4,
                  fontFamily: `'Poppins', sans-serif`,
                  fontWeight: 300,
                }}
              >
                Purpose-built for educational institutions, schools, parents, and learners. 
                Simplify procurement, reduce costs, and ensure reliable access to quality supplies.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ School Orders
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ Parent Access
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ Transparent Pricing
                </Typography>
              </Box>

              <Button
                onClick={handleAnySchool}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  mt: 4,
                  px: 4,
                  py: 1.2,
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontFamily: `'Poppins', sans-serif`,
                  fontSize: '0.95rem',
                  width: '100%',
                  boxShadow: hoveredCard === 'school'
                    ? '0 12px 24px rgba(37, 99, 235, 0.5)'
                    : '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  },
                }}
              >
                Explore AnySchool
              </Button>
            </Box>

            {/* AnyOffice Card */}
            <Box
              onClick={handleAnyOffice}
              onMouseEnter={() => setHoveredCard('office')}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.05) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                p: { xs: 4, md: 5 },
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: hoveredCard === 'office' ? 'translateY(-8px)' : 'translateY(0)',
                boxShadow: hoveredCard === 'office'
                  ? '0 25px 50px rgba(249, 115, 22, 0.2), 0 0 40px rgba(249, 115, 22, 0.15)'
                  : '0 8px 24px rgba(0, 0, 0, 0.2)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.6s',
                },
                '&:hover::before': {
                  left: '100%',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.8rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  mb: 2,
                  fontFamily: `'Poppins', sans-serif`,
                }}
              >
                AnyOffice
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.95rem',
                  color: '#e0f2fe',
                  lineHeight: 1.7,
                  mb: 4,
                  fontFamily: `'Poppins', sans-serif`,
                  fontWeight: 300,
                }}
              >
                Enterprise procurement platform for businesses and organizations. 
                Streamline purchasing, manage budgets, and optimize supply chains.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ Volume Pricing
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ Budget Controls
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    color: '#bae6fd',
                    fontFamily: `'Poppins', sans-serif`,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  ✓ Smart Workflows
                </Typography>
              </Box>

              <Button
                onClick={handleAnyOffice}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  mt: 4,
                  px: 4,
                  py: 1.2,
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontFamily: `'Poppins', sans-serif`,
                  fontSize: '0.95rem',
                  width: '100%',
                  boxShadow: hoveredCard === 'office'
                    ? '0 12px 24px rgba(249, 115, 22, 0.5)'
                    : '0 4px 12px rgba(249, 115, 22, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ea580c 0%, #d97706 100%)',
                  },
                }}
              >
                Explore AnyOffice
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Typography
            sx={{
              fontSize: '0.8rem',
              opacity: 0.7,
              color: '#e0f2fe',
              fontFamily: `'Poppins', sans-serif`,
              fontWeight: 300,
              letterSpacing: '0.3px',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            © 2026 TheStationeryHub | Empowering Education and Enterprise Through Smart Procurement
          </Typography>
        </Box>
      </Container>

      </Box>
    </Box>
  );
};

export default LandingPage;
