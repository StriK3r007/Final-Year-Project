import React, { useState, useEffect, useRef  } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress
} from "@mui/material";
import {
  LayoutDashboard,
  MapPin,
  Lock,
  LogOut,
  Menu as MenuIcon,
  Signal,
  Eye,
  EyeOff,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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

// Change Password Form Component (Now integrated into DriverDashboard.jsx)
const ChangePasswordForm = ({ onCancel }) => {
  const [formData, setFormData] = useState({ oldPassword: "", password: "", confirmPassword: "" });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    const token = localStorage.getItem("token");
    try {
      await axios.put("/api/auth/driver/change-password", { // Adjusted API endpoint
        currentPassword: formData.oldPassword,
        newPassword: formData.password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Password updated successfully.");
      onCancel(); // Navigate back to a default view
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error updating password.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save Password"}
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};


// A simple component to display the driver's current status and bus info
const DriverAnalytics = ({ user, sharingLocation, handleToggleLocation, isBusAssigned }) => (
  <Box p={4}>
    <Typography variant="h4" gutterBottom color="black">
      Driver Dashboard
    </Typography>
    <Card sx={{ mb: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Welcome, {user?.name || "Driver"}
        </Typography>
        {user?.assignedBus && typeof user.assignedBus === "object" ? (
          <Box>
            <Typography variant="body1">
              <strong>Assigned Bus:</strong> {user.assignedBus.number}
            </Typography>
            <Typography variant="body1">
              <strong>Route:</strong> {user.assignedBus.route?.name || "N/A"}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1" color="error">
            No bus assigned to you yet.
          </Typography>
        )}
      </CardContent>
    </Card>

    <Button
      variant="contained"
      color={sharingLocation ? "error" : "success"}
      onClick={handleToggleLocation}
      disabled={!isBusAssigned} // Disable button if no bus is assigned
      sx={{
        textTransform: "none",
        py: 1.5,
        px: 3,
        fontSize: "1rem",
        borderRadius: "8px",
      }}
    >
      <Signal style={{ marginRight: 8 }} />
      {sharingLocation ? "Stop Sharing Location" : "Start Sharing Location"}
    </Button>
  </Box>
);

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard />, view: "analytics" },
  { label: "Change Password", icon: <Lock />, view: "changePassword" },
];

const DriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showLocationError, setShowLocationError] = useState(false);
  const [showBusAssignmentError, setShowBusAssignmentError] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  const [activeView, setActiveView] = useState("analytics");
  const [openSidebar, setOpenSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Persistent socket reference
  const socketRef = useRef(null);

  useEffect(() => {
    // init socket once
    socketRef.current = io("http://localhost:5000", { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("✅ Driver socket connected:", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Driver socket disconnected");
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUserAndBus = async () => {
      setLoadingUser(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No authentication token found.");
          return;
        }

        const userRes = await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const driverData = userRes.data;

        if (driverData.assignedBus) {
          try {
            const busId = driverData.assignedBus._id || driverData.assignedBus;
            const busRes = await axios.get(`/api/buses/single/${busId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...driverData, assignedBus: busRes.data });
          } catch (busError) {
            console.error("Error fetching assigned bus info:", busError);
            toast.error("Failed to fetch assigned bus details.");
            setUser(driverData);
          }
        } else {
          setUser(driverData);
          setShowBusAssignmentError(true);
        }
      } catch (error) {
        console.error("Error fetching driver info:", error);
        toast.error("Failed to fetch driver information.");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndBus();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleToggleLocation = () => {
    if (!user || !user.assignedBus || typeof user.assignedBus !== "object") {
      setShowBusAssignmentError(true);
      return;
    }

    if (!sharingLocation) {
      // ✅ Start watching location
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socketRef.current.emit("locationUpdate", {
            driverId: user._id,
            latitude,
            longitude,
            busId: user.assignedBus._id,
          });
          console.log("📡 Sent location:", { latitude, longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setShowLocationError(true);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      setWatchId(id);
      setSharingLocation(true);
      toast.success("Started sharing location.");
    } else {
      // ✅ Stop watching location (socket stays connected!)
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setSharingLocation(false);
      toast.success("Stopped sharing location.");
      console.log("Stopped sharing location");
    }
  };

  useEffect(() => {
    const fetchUserAndBus = async () => {
      setLoadingUser(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No authentication token found.");
          return;
        }

        const userRes = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const driverData = userRes.data;

        if (driverData.assignedBus) {
          try {
            const busId = driverData.assignedBus._id || driverData.assignedBus;
            const busRes = await axios.get(`/api/buses/single/${busId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...driverData, assignedBus: busRes.data });
          } catch (busError) {
            console.error("Error fetching assigned bus info:", busError);
            toast.error("Failed to fetch assigned bus details.");
            setUser(driverData);
          }
        } else {
          setUser(driverData);
          setShowBusAssignmentError(true); // Show the dialog if no bus is assigned
        }
      } catch (error) {
        console.error("Error fetching driver info:", error);
        toast.error("Failed to fetch driver information.");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserAndBus();

    return () => {
      if (socket) socket.disconnect();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isSmallScreen);
      if (!isSmallScreen) {
        setOpenSidebar(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const handleToggleLocation = () => {
  //   // This check is now redundant due to the disabled button state,
  //   // but it's a good safety measure.
  //   if (!user || !user.assignedBus || typeof user.assignedBus !== "object") {
  //     setShowBusAssignmentError(true);
  //     return;
  //   }

  //   if (!sharingLocation) {
  //     const newSocket = io("http://localhost:5000");
  //     setSocket(newSocket);

  //     const id = navigator.geolocation.watchPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         newSocket.emit("locationUpdate", {
  //           driverId: user._id,
  //           latitude,
  //           longitude,
  //           busId: user.assignedBus._id,
  //         });
  //         console.log("Socket location sent:", latitude, longitude);
  //       },
  //       (error) => {
  //         console.error("Error getting location:", error);
  //         setShowLocationError(true);
  //       },
  //       {
  //         enableHighAccuracy: true,
  //         maximumAge: 0,
  //         timeout: 5000,
  //       }
  //     );

  //     setWatchId(id);
  //     setSharingLocation(true);
  //     toast.success("Started sharing location.");
  //   } else {
  //     if (socket) socket.disconnect();
  //     if (watchId) navigator.geolocation.clearWatch(watchId);
  //     setWatchId(null);
  //     setSharingLocation(false);
  //     setSocket(null);
  //     toast.success("Stopped sharing location.");
  //     console.log("Stopped sharing location");
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const renderContent = () => {
    if (loadingUser) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      );
    }
    switch (activeView) {
      case "analytics":
        const isBusAssigned = user?.assignedBus && typeof user.assignedBus === "object";
        return (
          <DriverAnalytics
            user={user}
            sharingLocation={sharingLocation}
            handleToggleLocation={handleToggleLocation}
            isBusAssigned={isBusAssigned}
          />
        );
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
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: "bold", marginBottom: 4 }}
        >
          Driver Panel
        </Typography>

        <List>
          {navItems.map((item) => (
            <ListItem
              button
              key={item.view}
              onClick={() => {
                setActiveView(item.view);
                if (isMobile) setOpenSidebar(false);
              }}
              sx={{
                backgroundColor:
                  activeView === item.view ? "#2c6e3f" : "transparent",
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
          <LogOut style={{ marginRight: 8 }} />
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

      {/* Custom Dialogs */}
      <Dialog
        open={showLocationError}
        onClose={() => setShowLocationError(false)}
      >
        <DialogTitle>{"Location Access Required"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please allow location access to share your bus's location.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLocationError(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showBusAssignmentError}
        onClose={() => setShowBusAssignmentError(false)}
      >
        <DialogTitle>{"Bus Assignment Required"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You cannot start sharing your location until an admin assigns a bus to your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBusAssignmentError(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverDashboard;
