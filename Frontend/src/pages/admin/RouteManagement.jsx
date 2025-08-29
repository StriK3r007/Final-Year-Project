import React, {
    useEffect,
    useState
} from "react";
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [form, setForm] = useState({
        name: "",
        description: "",
        startLatitude: "",
        startLongitude: "",
        endLatitude: "",
        endLongitude: ""
    });
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [routeToDelete, setRouteToDelete] = useState(null);
    const token = localStorage.getItem("token");

    // Fetch all routes from the backend API.
    const fetchRoutes = async () => {
        try {
            const res = await axios.get("/api/routes", {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            setRoutes(res.data);
        } catch (err) {
            console.error("Failed to fetch routes:", err);
            toast.error("Failed to fetch routes.");
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        if (!form.name || !form.startLatitude || !form.startLongitude || !form.endLatitude || !form.endLongitude) {
            toast.error("Please fill all required fields.");
            return;
        }

        const startLatitude = parseFloat(form.startLatitude);
        const startLongitude = parseFloat(form.startLongitude);
        const endLatitude = parseFloat(form.endLatitude);
        const endLongitude = parseFloat(form.endLongitude);

        if (isNaN(startLatitude) || isNaN(startLongitude) || isNaN(endLatitude) || isNaN(endLongitude)) {
            toast.error("All latitude and longitude fields must be valid numbers.");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: form.name,
                description: form.description,
                path: [{
                    latitude: startLatitude,
                    longitude: startLongitude
                }, {
                    latitude: endLatitude,
                    longitude: endLongitude
                }],
            };

            if (editingId) {
                await axios.put(`/api/routes/${editingId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
            } else {
                await axios.post("/api/routes", payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
            }
            setForm({
                name: "",
                description: "",
                startLatitude: "",
                startLongitude: "",
                endLatitude: "",
                endLongitude: ""
            });
            setEditingId(null);
            fetchRoutes();
            toast.success(editingId ? 'Route updated successfully!' : 'Route added successfully!');
        } catch (err) {
            console.error("Save failed:", err);
            toast.error(err.response?.data?.message || 'Failed to save route.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (route) => {
        const startPoint = route.path && route.path.length > 0 ? route.path[0] : {
            latitude: "",
            longitude: ""
        };
        const endPoint = route.path && route.path.length > 1 ? route.path[1] : {
            latitude: "",
            longitude: ""
        };
        setForm({
            name: route.name,
            description: route.description,
            startLatitude: startPoint.latitude,
            startLongitude: startPoint.longitude,
            endLatitude: endPoint.latitude,
            endLongitude: endPoint.longitude,
        });
        setEditingId(route._id);
    };

    const handleCancelEdit = () => {
        setForm({
            name: "",
            description: "",
            startLatitude: "",
            startLongitude: "",
            endLatitude: "",
            endLongitude: ""
        });
        setEditingId(null);
    };

    const handleDelete = (route) => {
        setRouteToDelete(route);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (isSubmitting || !routeToDelete) {
            return;
        }
        try {
            await axios.delete(`/api/routes/${routeToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            fetchRoutes();
            toast.success('Route deleted successfully!');
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.message || 'Failed to delete route.');
        } finally {
            setShowConfirm(false);
            setRouteToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
        setRouteToDelete(null);
    };

    const isRowActionDisabled = !!editingId || isSubmitting;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">Manage Routes</h2>
            <div className="space-y-4 max-w-md">
                <TextField
                    name="name"
                    label="Route Name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    name="description"
                    label="Description (Optional)"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                />
                <TextField
                    name="startLatitude"
                    label="Start Latitude"
                    value={form.startLatitude}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    type="number"
                />
                <TextField
                    name="startLongitude"
                    label="Start Longitude"
                    value={form.startLongitude}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    type="number"
                />
                <TextField
                    name="endLatitude"
                    label="End Latitude"
                    value={form.endLatitude}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    type="number"
                />
                <TextField
                    name="endLongitude"
                    label="End Longitude"
                    value={form.endLongitude}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    type="number"
                />
                <div className="flex gap-2">
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        fullWidth
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (editingId ? "Update Route" : "Add Route")}
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
                            <TableCell>Description</TableCell>
                            <TableCell>Start Coordinates</TableCell>
                            <TableCell>End Coordinates</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {routes.map((route) => (
                            <TableRow key={route._id}>
                                <TableCell>{route.name}</TableCell>
                                <TableCell>{route.description}</TableCell>
                                <TableCell>
                                    {route.path && route.path.length > 0 ? `${route.path[0].latitude}, ${route.path[0].longitude}` : "N/A"}
                                </TableCell>
                                <TableCell>
                                    {route.path && route.path.length > 1 ? `${route.path[1].latitude}, ${route.path[1].longitude}` : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <IconButton
                                            onClick={() => handleEdit(route)}
                                            color="primary"
                                            disabled={isRowActionDisabled}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDelete(route)}
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
                        Are you sure you want to delete the route "{routeToDelete?.name}"? This action cannot be undone.
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

export default RouteManagement;