// routeController.js
// Contains the business logic for managing bus routes, including validation.
const Route = require('../models/routeModel');
const Bus = require('../models/busModel'); // We'll need this to prevent deleting a route in use.

// Get all bus routes
exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.find().populate('stops');
        res.status(200).json(routes);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// Get all public routes (lightweight data for map view)
exports.getPublicRoutes = async (req, res) => {
    try {
        const routes = await Route.find().select('name path');
        res.status(200).json(routes);
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch public routes',
            error: err.message
        });
    }
};

// Create a new bus route
exports.createRoute = async (req, res) => {
    const {
        name,
        description,
        path,
        stops
    } = req.body;
    try {
        // Server-side validation
        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: 'Route name is required.'
            });
        }
        if (!path || !Array.isArray(path) || path.length === 0) {
            return res.status(400).json({
                message: 'Route path is required and must be an array of coordinates.'
            });
        }
        const existingRoute = await Route.findOne({
            name
        });
        if (existingRoute) {
            return res.status(400).json({
                message: 'A route with this name already exists.'
            });
        }

        const newRoute = new Route({
            name,
            description,
            path,
            stops
        });
        await newRoute.save();
        res.status(201).json({
            message: 'Route created successfully!',
            route: newRoute
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: 'Error creating route',
            error: err.message
        });
    }
};

// Update an existing bus route
exports.updateRoute = async (req, res) => {
    const {
        id
    } = req.params;
    const updates = req.body;
    try {
        const route = await Route.findByIdAndUpdate(id, updates, {
            new: true,
        });
        if (!route) {
            return res.status(404).json({
                error: 'Route not found'
            });
        }
        res.status(200).json(route);
    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }
};

// Delete a bus route
exports.deleteRoute = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        // Check if any buses are assigned to this route before deleting.
        const busesOnRoute = await Bus.find({
            route: id
        });
        if (busesOnRoute.length > 0) {
            return res.status(400).json({
                message: 'Cannot delete route. It is currently assigned to one or more buses.'
            });
        }

        const route = await Route.findByIdAndDelete(id);
        if (!route) {
            return res.status(404).json({
                error: 'Route not found'
            });
        }
        res.status(200).json({
            message: 'Route deleted successfully!'
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
