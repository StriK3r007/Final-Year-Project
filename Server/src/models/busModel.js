const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: false
    },
    // The route is now a reference to the 'Route' model, not a simple string.
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    currentLocation: {
        latitude: {
            type: Number,
            required: false
        },
        longitude: {
            type: Number,
            required: false
        },
    },
    trips: [{
        startTime: Date,
        endTime: Date,
        startLocation: {
            latitude: Number,
            longitude: Number
        },
        endLocation: {
            latitude: Number,
            longitude: Number
        },
    }],
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: false
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Bus', busSchema);
