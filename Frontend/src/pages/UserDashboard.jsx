import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Button, CircularProgress, Card, CardContent, TextField, Link, InputAdornment } from "@mui/material";
import { Users, Lock, LogOut, Menu as MenuIcon, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// The style for the dashboard, mimicking AdminDashboard.jsx
const drawerWidth = 240;

const navItems = [
  { label: "Profile", icon: <Users />, view: "profile" },
  { label: "Change Password", icon: <Lock />, view: "changePassword" },
];

// Function to validate the password against a set of rules
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number.");
  }
  if (!/[!@#$%^&*()]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*()).");
  }
  return errors;
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("profile");
  const [openSidebar, setOpenSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", oldPassword: "", password: "", confirmPassword: "" });
  // State for password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // State for password validation errors
  const [passwordErrors, setPasswordErrors] = useState([]);

  const token = localStorage.getItem("token");

  // Handle mobile responsiveness
  const handleResize = () => {
    const isSmallScreen = window.innerWidth <= 768;
    setIsMobile(isSmallScreen);
    if (!isSmallScreen) {
      setOpenSidebar(true);
    } else {
      setOpenSidebar(false);
    }
  };

  // Attach resize listener
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setFormData({
          name: res.data?.name || "",
          email: res.data?.email || "",
          oldPassword: "",
          password: "",
          confirmPassword: ""
        });
      } catch (err) {
        toast.error("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Run validation on the new password field as the user types
    if (e.target.name === "password") {
      const errors = validatePassword(e.target.value);
      setPasswordErrors(errors);
    }
  };

  const handleSave = async () => {
    if (!user?._id) {
      toast.error("Error updating profile: User ID not found.");
      return;
    }

    const updatePayload = {};
    let apiUrl = `/api/auth/${user._id}`; // Default API URL for profile updates
    let method = "put"; // Default method for profile updates

    if (activeView === "profile") {
      if (formData.name === user.name && formData.email === user.email) {
        toast("No changes to save.", { icon: 'ℹ️' });
        return;
      }
      updatePayload.name = formData.name;
      updatePayload.email = formData.email;
    } else if (activeView === "changePassword") {
      // Basic field validation
      if (!formData.oldPassword || !formData.password || !formData.confirmPassword) {
        toast.error("All password fields must be filled to change your password.");
        return;
      }
      // Password match validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
      // Password cannot be the same as old password
      if (formData.password === formData.oldPassword) {
        toast.error("New password cannot be the same as the current password.");
        return;
      }
      // Run the more detailed validation
      const errors = validatePassword(formData.password);
      if (errors.length > 0) {
        toast.error("New password does not meet the complexity requirements.");
        setPasswordErrors(errors);
        return;
      }
      
      // Update API URL and payload for password change
      apiUrl = "/api/auth/change-password";
      method = "put";
      updatePayload.currentPassword = formData.oldPassword;
      updatePayload.newPassword = formData.password;
    }

    if (Object.keys(updatePayload).length === 0) {
      toast.error("No changes detected.");
      return;
    }

    try {
      if (method === "put") {
        await axios.put(apiUrl, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else { // method === "post"
        await axios.post(apiUrl, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
      toast.success("Profile updated successfully.");
      setFormData(prevData => ({ ...prevData, oldPassword: "", password: "", confirmPassword: "" }));
      setActiveView("profile");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error updating profile.";
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">Failed to load user data.</Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return (
          <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Profile Information</Typography>
              <TextField
                margin="normal"
                fullWidth
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                fullWidth
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <Typography variant="body1"><strong>Role:</strong> {user.role}</Typography>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleSave}>
                  Save Profile
                </Button>
                <Button variant="outlined" onClick={() => setActiveView("changePassword")}>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      case "changePassword":
        return (
          <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 4 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>Change Password</Typography>
              
              {/* Current Password Field with Eye Icon */}
              <TextField
                margin="normal"
                fullWidth
                name="oldPassword"
                label="Current Password"
                type={showOldPassword ? "text" : "password"}
                value={formData.oldPassword}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                        {showOldPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* New Password Field with Eye Icon */}
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                        {showNewPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Password Validation */}
              {formData.password && passwordErrors.length > 0 && (
                <Box sx={{ mt: 1, ml: 2, color: "error.main" }}>
                  <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: "bold" }}>
                    Password must contain:
                  </Typography>
                  <List dense>
                    {passwordErrors.map((error, index) => (
                      <ListItem key={index} sx={{ py: 0, pl: 0 }}>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {/* Confirm New Password Field with Eye Icon */}
              <TextField
                margin="normal"
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Action Buttons */}
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleSave}>
                  Save Password
                </Button>
                <Button variant="outlined" onClick={() => setActiveView("profile")}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Box display="flex" width="100vw" height="100vh">
      <Toaster position="top-center" reverseOrder={false} />
      {isMobile && (
        <IconButton
          onClick={() => setOpenSidebar(!openSidebar)}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 1000,
            backgroundColor: "#388e3c",
            color: "white",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "#2c6e3f",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={openSidebar}
        onClose={() => setOpenSidebar(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#388e3c",
            color: "white",
            padding: "16px",
            boxSizing: "border-box",
            position: isMobile ? "absolute" : "static",
            height: "100vh",
          },
        }}
      >
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", marginBottom: 4 }}>
          User Dashboard
        </Typography>

        <List>
          {navItems.map((item) => (
            <ListItem
              button={true}
              key={item.view}
              onClick={() => {
                setActiveView(item.view);
                if (isMobile) {
                  setOpenSidebar(false);
                }
              }}
              sx={{
                backgroundColor: activeView === item.view ? "#2c6e3f" : "transparent",
                borderRadius: "8px",
                marginBottom: "8px",
                "&:hover": { backgroundColor: "#2c6e3f" },
                cursor: "pointer",
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} sx={{ color: "white" }} />
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          color="error"
          fullWidth
          sx={{
            marginTop: "auto",
            textTransform: "none",
          }}
          onClick={handleLogout}
        >
          <LogOut sx={{ marginRight: 1 }} />
          Logout
        </Button>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        flex={1}
        sx={{
          backgroundColor: "#f5f5f5",
          padding: "16px",
          overflowY: "auto",
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default UserDashboard;

