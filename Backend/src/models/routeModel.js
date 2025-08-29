// routeModel.js
// Defines the Mongoose schema for a bus route.
// A route includes a name, a description, an array of geographical path coordinates,
// and a reference to the stops it services.

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    // The unique name of the route (e.g., 'Route 1', 'Green Line').
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    // A description of the route.
    description: {
        type: String,
        required: false,
        trim: true,
    },
    // The geographical path of the route as a series of coordinates.
    // This allows for drawing the route line on the map.
    path: [{
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {
            type: Number,
            required: true,
        },
    }],
    // An array of references to the Stop documents that belong to this route.
    // The `ref: 'Stop'` links this to the Stop model.
    stops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
    }],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically.
});

module.exports = mongoose.model('Route', routeSchema);
