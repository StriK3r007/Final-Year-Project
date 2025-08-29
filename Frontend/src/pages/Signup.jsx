import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField, Box, Link, Card, CardContent, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LockOutlined, EmailOutlined, AccountCircleOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { Toaster, toast } from 'react-hot-toast';

// Define a custom theme to use throughout the application.
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

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // State to hold form validation errors
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Function to toggle password visibility for the main password field.
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  
  // Function to toggle password visibility for the confirm password field.
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  // Function to validate form fields and collect all errors into a single message.
  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;
    const passwordErrors = [];

    // Name validation
    if (!form.name.trim()) {
      tempErrors.name = 'Full Name is required.';
      isValid = false;
    }

    // Email validation
    if (!form.email.trim()) {
      tempErrors.email = 'Email is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = 'Email address is invalid.';
      isValid = false;
    }

    // Password validation with new security features
    if (!form.password.trim()) {
        passwordErrors.push('Password is required.');
        isValid = false;
    } else {
        if (form.password.length < 8) {
            passwordErrors.push('Password must be at least 8 characters long.');
            isValid = false;
        }
        if (!/(?=.*[a-z])/.test(form.password)) {
            passwordErrors.push('Password must contain at least one lowercase letter.');
            isValid = false;
        }
        if (!/(?=.*[A-Z])/.test(form.password)) {
            passwordErrors.push('Password must contain at least one uppercase letter.');
            isValid = false;
        }
        if (!/(?=.*\d)/.test(form.password)) {
            passwordErrors.push('Password must contain at least one number.');
            isValid = false;
        }
        if (!/(?=.*[!@#$%^&*])/.test(form.password)) {
            passwordErrors.push('Password must contain at least one special character (!@#$%^&*).');
            isValid = false;
        }
    }

    // Confirm Password validation
    if (!form.confirmPassword.trim()) {
        tempErrors.confirmPassword = 'Confirm Password is required.';
        isValid = false;
    } else if (form.password !== form.confirmPassword) {
      passwordErrors.push('Passwords do not match.');
      isValid = false;
    }
    
    // Combine password errors into a single string for the toast
    if (passwordErrors.length > 0) {
        tempErrors.password = passwordErrors.join('\n');
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the error for the field as the user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // If form is not valid, display the combined password error message
      if (errors.password) {
        toast.error(errors.password, {
            style: { whiteSpace: 'pre-line' } // Enable multiline toast
        });
      }
      return; 
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        ...form,
        role: 'user', // You can allow choosing role later if needed
      });
      localStorage.setItem('token', res.data.token);
      
      // Use toast for successful signup notification
      toast.success('Signup successful!');

      // Navigate to login page after a short delay to allow toast to show
      setTimeout(() => {
        navigate('/login');
      }, 2000); 
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage); // Use toast for error notification
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
            backgroundImage: 'url(https://source.unsplash.com/random?nature,forest&orientation=landscape)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            Join Us
          </Typography>
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
            Create an account to start your journey with Green Bus.
          </Typography>
        </Box>

        {/* Right pane for the signup form */}
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
                Sign Up
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Enter your details to create an account.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: <AccountCircleOutlined color="action" sx={{ mr: 1 }} />,
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
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
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!errors.password} // Add this line
                  helperText={errors.password} // Add this line
                  InputProps={{
                    startAdornment: <LockOutlined color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {/* New confirm password field */}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword} // Add this line
                  helperText={errors.confirmPassword} // Add this line
                  InputProps={{
                    startAdornment: <LockOutlined color="action" sx={{ mr: 1 }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                </Button>
              </Box>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{' '}
                <Link href="/login" underline="hover">
                  Log in
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
      {/* Container for toast notifications */}
      <Toaster position="top-center" />
    </ThemeProvider>
  );
};

export default Signup;
