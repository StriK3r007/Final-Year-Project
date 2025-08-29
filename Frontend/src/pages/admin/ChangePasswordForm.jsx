import { useState } from "react";
import axios from "axios";
import { 
  TextField, 
  Button, 
  Typography, 
  CircularProgress, 
  Box 
} from "@mui/material";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password", // API URL
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        maxWidth: 400, 
        margin: "auto", 
        padding: 4, 
        backgroundColor: "white", 
        borderRadius: 2, 
        boxShadow: 3
      }}
    >
      {/* Change the title color to a contrasting one */}
      <Typography 
        variant="h5" 
        align="center" 
        gutterBottom 
        color="text.primary" // Here we set the title color to text.primary
      >
        Change Password
      </Typography>
      
      <form onSubmit={handleSubmit} noValidate>
        {/* Current Password */}
        <TextField
          label="Current Password"
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />

        {/* New Password */}
        <TextField
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />

        {/* Confirm New Password */}
        <TextField
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          required
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Update Password"
          )}
        </Button>
      </form>

      {/* Message */}
      {message && (
        <Typography 
          variant="body2" 
          color={message.includes("do not match") ? "error" : "primary"} 
          align="center" 
          sx={{ marginTop: 2 }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}
