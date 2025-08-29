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
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import io from 'socket.io-client';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", phone: "", busId: "", licenseNumber: "" });
    const [editingId, setEditingId] = useState(null);
    const token = localStorage.getItem("token");
    const [buses, setBuses] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);

    const fetchDrivers = async () => {
        try {
            const res = await axios.get("/api/drivers", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDrivers(res.data);
        } catch (err) {
            console.error("Failed to fetch drivers:", err);
            toast.error("Failed to fetch drivers.");
        }
    };

    const fetchBuses = async () => {
        try {
            const res = await axios.get('/api/buses/public');
            setBuses(res.data);
        } catch (err) {
            console.error('Failed to fetch buses:', err);
            toast.error('Failed to fetch buses.');
        }
    };

    useEffect(() => {
        fetchBuses();
        fetchDrivers();
    }, []);

    // Corrected useEffect to manage the Socket.IO connection
    useEffect(() => {
        const socket = io('http://localhost:5000');
        let intervalId;

        const emitLocation = () => {
            if (drivers.length > 0) {
                // Use a consistent driver to track.
                // You could also iterate through all drivers if you want.
                const driverToTrack = drivers[0];
                const driverId = driverToTrack._id;
                
                // Use more specific, stable coordinates for simulation
                const baseLat = 30.1775;
                const baseLng = 66.9900;
                const latitude = baseLat + (Math.random() - 0.5) * 0.01;
                const longitude = baseLng + (Math.random() - 0.5) * 0.01;

                socket.emit('busLocationUpdate', {
                    driverId: driverId,
                    latitude: latitude,
                    longitude: longitude,
                });
                console.log(`Emitting location for driver ${driverId}`);
            }
        };
        
        socket.on('connect', () => {
            console.log('Driver connected');
            // Start emitting locations once a connection is established
            emitLocation();
            intervalId = setInterval(emitLocation, 3000);
        });

        socket.on('disconnect', () => {
            console.log('Driver disconnected');
            clearInterval(intervalId);
        });

        // Clean up the socket connection when the component unmounts or dependencies change
        return () => {
            socket.disconnect();
            clearInterval(intervalId);
        };
    }, [drivers]); // <-- The crucial change: this effect now depends on the `drivers` state

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let driverResponse;
            if (editingId) {
                driverResponse = await axios.put(`/api/drivers/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                driverResponse = await axios.post("/api/drivers", form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            const driverId = editingId || driverResponse.data.driver._id;

            if (form.busId) {
                await axios.put(`/api/buses/${form.busId}`, { driver: driverId }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success(`Driver ${editingId ? 'updated and assigned' : 'created and assigned'} to bus!`);
            } else {
                toast.success(editingId ? 'Driver updated!' : 'Driver added!');
            }

            setForm({ name: "", email: "", phone: "", busId: "", licenseNumber: "" });
            setEditingId(null);
            fetchDrivers(); // Re-fetch to update the drivers state
        } catch (err) {
            console.error("Save failed:", err);
            toast.error(err.response?.data?.message || 'Failed to save driver.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (driver) => {
        setForm({
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            busId: driver.busId?._id || "",
            licenseNumber: driver.licenseNumber || "",
        });
        setEditingId(driver._id);
    };

    const handleCancelEdit = () => {
        setForm({ name: "", email: "", phone: "", busId: "", licenseNumber: "" });
        setEditingId(null);
    };

    // Handler to open the confirmation dialog
    const handleDelete = (driver) => {
        setDriverToDelete(driver);
        setShowConfirm(true);
    };

    // Handler to confirm and execute deletion
    const handleConfirmDelete = async () => {
        if (isSubmitting || !driverToDelete) return;

        try {
            await axios.delete(`/api/drivers/${driverToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchDrivers();
            toast.success('Driver deleted successfully!');
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.message || 'Failed to delete driver.');
        } finally {
            setShowConfirm(false);
            setDriverToDelete(null);
        }
    };

    // Handler to close the confirmation dialog
    const handleCancelDelete = () => {
        setShowConfirm(false);
        setDriverToDelete(null);
    };

    const isRowActionDisabled = !!editingId || isSubmitting;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Drivers</h2>
            <div className="space-y-4 max-w-md">
                <TextField
                    name="name"
                    label="Name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="name"
                />
                <TextField
                    name="email"
                    label="Email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="email"
                />
                <TextField
                    name="phone"
                    label="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="tel"
                />
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel htmlFor="busId">Select Bus</InputLabel>
                    <Select
                        id="busId"
                        name="busId"
                        value={form.busId || ''}
                        onChange={(e) => setForm({ ...form, busId: e.target.value })}
                        label="Select a bus"
                    >
                        <MenuItem value="">Select a bus</MenuItem>
                        {buses.map((bus) => (
                            <MenuItem key={bus._id} value={bus._id}>
                                {bus.number}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    name="licenseNumber"
                    label="License Number"
                    value={form.licenseNumber}
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
                        {editingId ? "Update Driver" : "Add Driver"}
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
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Bus ID</TableCell>
                            <TableCell>License Number</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {drivers.map((driver) => (
                            <TableRow key={driver._id}>
                                <TableCell>{driver.name}</TableCell>
                                <TableCell>{driver.email}</TableCell>
                                <TableCell>{driver.phone}</TableCell>
                                <TableCell>{driver.busId?.number}</TableCell>
                                <TableCell>{driver.licenseNumber}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <IconButton
                                            onClick={() => handleEdit(driver)}
                                            color="primary"
                                            disabled={isRowActionDisabled}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(driver)}
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
                        Are you sure you want to delete the driver "{driverToDelete?.name}"? This action cannot be undone.
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

export default DriverManagement;