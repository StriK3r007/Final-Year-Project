import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from 'react-hot-toast';
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ number: "", route: "", capacity: "" });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch all buses
  const fetchBuses = async () => {
    try {
      const res = await axios.get("/api/buses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuses(res.data);
    } catch (err) {
      console.error("Failed to fetch buses:", err);
      toast.error("Failed to fetch buses.");
    }
  };

  // Fetch all available routes
  const fetchRoutes = async () => {
    try {
      const res = await axios.get("/api/routes/public", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(res.data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      toast.error("Failed to fetch routes.");
    }
  };

  // Initial data fetch on component load
  useEffect(() => {
    fetchBuses();
    fetchRoutes();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling for capacity to ensure it's a number
    if (name === "capacity") {
      setForm({ ...form, [name]: value === "" ? "" : parseInt(value, 10) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle form submission (add or update)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        capacity: form.capacity !== "" ? Number(form.capacity) : null, // Ensure capacity is a number or null
      };
      if (editingId) {
        await axios.put(`/api/buses/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/buses", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm({ number: "", route: "", capacity: "" });
      setEditingId(null);
      fetchBuses();
      toast.success(editingId ? 'Bus updated successfully!' : 'Bus added successfully!');
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.response?.data?.message || 'Failed to save bus.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit action
  const handleEdit = (bus) => {
    setForm({ number: bus.number, route: bus.route._id, capacity: bus.capacity });
    setEditingId(bus._id);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setForm({ number: "", route: "", capacity: "" });
    setEditingId(null);
  };

  // Handle delete action with a confirmation dialog
  const handleDelete = (bus) => {
    setBusToDelete(bus);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isSubmitting || !busToDelete) {
      return;
    }
    try {
      await axios.delete(`/api/buses/${busToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBuses();
      toast.success('Bus deleted successfully!');
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || 'Failed to delete bus.');
    } finally {
      setShowConfirm(false);
      setBusToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setBusToDelete(null);
  };

  const isRowActionDisabled = !!editingId || isSubmitting;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Buses</h2>

      <div className="space-y-4 max-w-md">
        <TextField
          name="number"
          label="Bus Number"
          value={form.number}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Route</InputLabel>
          <Select
            name="route"
            value={form.route}
            onChange={handleChange}
            label="Route"
          >
            {routes.map((route) => (
              <MenuItem key={route._id} value={route._id}>
                {route.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          name="capacity"
          label="Capacity"
          type="number"
          value={form.capacity}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            fullWidth
          >
            {editingId ? "Update Bus" : "Add Bus"}
          </Button>
          {editingId && (
            <Button
              onClick={handleCancelEdit}
              variant="outlined"
              color="secondary"
              disabled={isSubmitting}
              fullWidth
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <TableContainer component={Paper} className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buses.map((bus) => (
              <TableRow key={bus._id}>
                <TableCell>{bus.number}</TableCell>
                <TableCell>{bus.route ? bus.route.name : 'N/A'}</TableCell>
                <TableCell>{bus.capacity}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <IconButton
                      onClick={() => handleEdit(bus)}
                      color="primary"
                      disabled={isRowActionDisabled}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(bus)}
                      color="error"
                      disabled={isRowActionDisabled}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isSubmitting && (
        <div className="flex justify-center mt-4">
          <CircularProgress />
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirm}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete bus number: {busToDelete?.number}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BusManagement;
