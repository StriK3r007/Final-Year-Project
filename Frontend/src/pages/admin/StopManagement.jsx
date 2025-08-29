import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  TextField,
  Button,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const StopManagement = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", route: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stopToDelete, setStopToDelete] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch all stops
  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/stops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStops(res.data);
    } catch (err) {
      console.error("Failed to fetch stops:", err);
      toast.error("Failed to fetch stops.");
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchStops();
    fetchRoutes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.latitude || !form.longitude || !form.name || !form.route) {
      toast.error("Please fill all fields.");
      return;
    }

    const latitude = parseFloat(form.latitude);
    const longitude = parseFloat(form.longitude);

    if (isNaN(latitude) || isNaN(longitude)) {
      toast.error("Latitude and Longitude must be valid numbers.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        location: { latitude, longitude },
        route: form.route,
      };

      if (editingId) {
        await axios.put(`/api/stops/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/stops", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ name: "", latitude: "", longitude: "", route: "" });
      setEditingId(null);
      fetchStops();
      toast.success(editingId ? "Stop updated successfully!" : "Stop added successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.response?.data?.message || "Failed to save stop.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stop) => {
    setForm({
      name: stop.name,
      latitude: stop.location.latitude,
      longitude: stop.location.longitude,
      // Check if route is an object or just an ID string
      route: stop.route && typeof stop.route === 'object' ? stop.route._id : stop.route,
    });
    setEditingId(stop._id);
  };

  const handleDelete = (stop) => {
    setStopToDelete(stop);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!stopToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`/api/stops/${stopToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStops();
      if (editingId === stopToDelete._id) {
        setForm({ name: "", latitude: "", longitude: "", route: "" });
        setEditingId(null);
      }
      toast.success("Stop deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.response?.data?.message || "Failed to delete stop.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setStopToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setStopToDelete(null);
  };

  const isRowActionDisabled = loading || editingId;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Stops</h2>

      <div className="space-y-4 max-w-md">
        <TextField
          name="name"
          label="Stop Name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
          autoComplete="name"
        />
        <TextField
          name="latitude"
          label="Latitude"
          value={form.latitude}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
          type="number"
        />
        <TextField
          name="longitude"
          label="Longitude"
          value={form.longitude}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          margin="normal"
          type="number"
        />

        {/* Dropdown input field for Route */}
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

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : editingId ? "Update Stop" : "Add Stop"}
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setForm({ name: "", latitude: "", longitude: "", route: "" });
                setEditingId(null);
              }}
              variant="outlined"
              color="secondary"
              disabled={loading}
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
              <TableCell>Name</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Route</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stops.map((stop) => (
              <TableRow key={stop._id}>
                <TableCell>{stop.name}</TableCell>
                <TableCell>{stop.location.latitude}</TableCell>
                <TableCell>{stop.location.longitude}</TableCell>
                <TableCell>
                  {/* Corrected logic to display the route name */}
                  {stop.route && typeof stop.route === 'object' 
                    ? stop.route.name 
                    : routes.find(r => r._id === stop.route)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <IconButton
                      onClick={() => handleEdit(stop)}
                      color="primary"
                      disabled={isRowActionDisabled}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(stop)}
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

      {loading && (
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
            Are you sure you want to delete the stop: {stopToDelete?.name}? This action cannot be undone.
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

export default StopManagement;