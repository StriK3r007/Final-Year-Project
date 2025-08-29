import React, { useState } from 'react';
import { Button, Typography, TextField, Box, Link, Card, CardContent, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { LockOutlined, EmailOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

// Define a custom theme to use throughout the application.
// This is necessary to access theme properties like palette colors.
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f4f5f7',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // New state to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  // Function to validate form fields
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email address is invalid.';
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      tempErrors.password = 'Password is required.';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const { user, token } = res.data;
      const role = user.role;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      toast.success('Login successful!');

      if (role === 'admin' || role === 'super-admin') {
        setTimeout(() => navigate('/admin-dashboard'), 2000);
      } else if (role === 'user') {
        setTimeout(() => navigate('/user-dashboard'), 2000);
      } else if (role === 'driver') {
        setTimeout(() => navigate('/driver/dashboard'), 2000);
      } else {
        setTimeout(() => navigate('/unauthorized'), 2000);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Wrap the component with ThemeProvider to ensure styled components work correctly.
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#006600',
        }}
      >
        {/* Left pane for visual appeal */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' }, // Hide on small screens
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            backgroundImage: 'url(https://source.unsplash.com/random?city,urban&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Green Bus
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Your one-stop solution for bus and driver management.
          </Typography>
        </Box>

        {/* Right pane for the login form */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: 3,
              p: 4,
            }}
          >
            <CardContent>
              <Typography variant="h4" component="h2" align="center" sx={{ mb: 1, fontWeight: 'bold' }}>
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Welcome back! Please log in to your account.
              </Typography>

              <Box component="form" onSubmit={handleLogin} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <EmailOutlined color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  // Conditionally set the input type based on the showPassword state
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: <LockOutlined color="action" sx={{ mr: 1 }} />,
                    // Add the eye icon at the end of the input field
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {/* Conditionally render the eye icon based on showPassword state */}
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
              </Box>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Don't have an account?{' '}
                <Link href="/signup" underline="hover">
                  Sign up
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Toaster />
    </ThemeProvider>
  );
};

export default Login;

