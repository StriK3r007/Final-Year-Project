// * Working Code-start
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Button, Card, CardContent, TextField, InputAdornment } from "@mui/material";
import { LayoutDashboard, Bus, Users, MapPin, Lock, LogOut, Map, Route, Eye, EyeOff, Menu as MenuIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Import your local components
import MapView from "../../components/MapComponent";
import Analytics from "../admin/Analytics";
import BusManagement from "../admin/BusManagement";
import DriverManagement from "../admin/DriverManagement";
import StopManagement from "../admin/StopManagement";
import RouteManagement from "../admin/RouteManagement";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, view: "analytics" },
  { label: "Routes", icon: <Route />, view: "routes" },
  { label: "Buses", icon: <Bus />, view: "buses" },
  { label: "Drivers", icon: <Users />, view: "drivers" },
  { label: "Stops", icon: <MapPin />, view: "stops" },
  { label: "MapView", icon: <Map />, view: "map" },
  { label: "Change Password", icon: <Lock />, view: "changePassword" },
];

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters long.");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter.");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter.");
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number.");
  if (!/[!@#$%^&*()]/.test(password)) errors.push("Password must contain at least one special character (!@#$%^&*()).");
  return errors;
};

const ChangePasswordForm = ({ onCancel }) => {
  const [formData, setFormData] = useState({ oldPassword: "", password: "", confirmPassword: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      const errors = validatePassword(e.target.value);
      setPasswordErrors(errors);
    }
  };

  const handleSave = async () => {
    if (!formData.oldPassword || !formData.password || !formData.confirmPassword) {
      toast.error("All password fields must be filled.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (formData.password === formData.oldPassword) {
      toast.error("New password cannot be the same as the current password.");
      return;
    }
    const errors = validatePassword(formData.password);
    if (errors.length > 0) {
      toast.error("New password does not meet the complexity requirements.");
      setPasswordErrors(errors);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.put("/api/auth/admin/change-password", {
        currentPassword: formData.oldPassword,
        newPassword: formData.password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Password updated successfully.");
      onCancel();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error updating password.";
      toast.error(errorMessage);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 4 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>Change Password</Typography>
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
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" onClick={handleSave}>
            Save Password
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("analytics");
  const [openSidebar, setOpenSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // State removed: const [selectedStop, setSelectedStop] = useState(null);

  const handleResize = () => {
    const isSmallScreen = window.innerWidth <= 768;
    setIsMobile(isSmallScreen);
    if (!isSmallScreen) {
      setOpenSidebar(true);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const renderContent = () => {
    switch (activeView) {
      case "analytics":
        return <Analytics />;
      case "routes":
        return <RouteManagement />;
      case "buses":
        return <BusManagement />;
      case "drivers":
        return <DriverManagement />;
      case "stops":
        return <StopManagement />;
      case "map":
        // MapView is now a self-contained component
        return <MapView />;
      case "changePassword":
        return <ChangePasswordForm onCancel={() => setActiveView("analytics")} />;
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
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
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
          Admin Panel
        </Typography>

        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.view}
              onClick={() => setActiveView(item.view)}
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
}