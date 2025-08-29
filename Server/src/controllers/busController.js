// *Updated Code:
const Bus = require('../models/busModel');
const Driver = require('../models/driverModel'); // Import the Driver model
const Route = require('../models/routeModel'); // Import Route model

// Create a Bus
exports.createBus = async (req, res) => {
    const { number, route, currentLocation, capacity } = req.body;
    try {
        // Ensure the user has the correct role to create a driver
        if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
            return res.status(403).json({ message: 'You do not have permission to create drivers' });
        }

        // --- SERVER-SIDE VALIDATION ---
        if (!number || number.trim() === '') {
            return res.status(400).json({ message: 'Bus number is required.' });
        }
        // Check if the bus already exists
        const existingBus = await Bus.findOne({ number });
        if (existingBus) {
            console.log('Bus with this number already exists');
            return res.status(400).json({ message: 'Bus with this number already exists' });
        }
        if (!route || route.trim() === '') {
            return res.status(400).json({ message: 'Route is required.' });
        }
        // Check if capacity is a valid number
        if (capacity === null || capacity === undefined || isNaN(capacity)) {
            return res.status(400).json({ message: 'Capacity must be a valid number.' });
        }
        // --- END OF VALIDATION ---

        const bus = new Bus({ number, route, currentLocation, capacity, createdBy: req.user._id});
        await bus.save();

        res.status(201).json({ message: 'Bus created Succesfully', bus });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating bus', error: err.message });
    }
};

// Get all Buses with their Drivers and Routes
exports.getBuses = async (req, res) => {
    try {
        const buses = await Bus.find().populate('driver').populate('route');
        res.status(200).json(buses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a single Bus by ID
exports.getBusById = async (req, res) => {
    try {
        const { id } = req.params;
        const bus = await Bus.findById(id).populate('driver').populate('route'); // Populate both driver and route
        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        res.status(200).json(bus);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bus details', error: err.message });
    }
};

// Update a Bus
exports.updateBus = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const bus = await Bus.findByIdAndUpdate(id, updates, { new: true });
        if (!bus) return res.status(404).json({ error: 'Bus not found' });
        res.status(200).json(bus);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a Bus
exports.deleteBus = async (req, res) => {
    const { id } = req.params;
    try {
        const bus = await Bus.findByIdAndDelete(id);
        if (!bus) return res.status(404).json({ error: 'Bus not found' });
        res.status(200).json({ message: 'Bus deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logTrip = async (req, res) => {
    const { id } = req.params;
    const { startTime, endTime, startLocation, endLocation } = req.body;
    try {
        const bus = await Bus.findById(id);
        if (!bus) return res.status(404).json({ error: 'Bus not found' });

        bus.trips.push({ startTime, endTime, startLocation, endLocation });
        await bus.save();
        res.status(200).json(bus);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getPublicBuses = async (req, res) => {
    try {
        const buses = await Bus.find()
            .select('_id number route') // Select the fields you need for the dropdown
            .populate({
                path: 'driver',
                select: '_id name userId' // You might not need to populate driver here for the dropdown
            });
        console.log('All public buses fetched (before response):', JSON.stringify(buses, null, 2));
        res.status(200).json(buses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch buses', error: err.message });
    }
};

exports.updateBusLocation = async (req, res) => {
    const { latitude, longitude } = req.body;
    const busId = req.params.id;

    try {
        const bus = await Bus.findByIdAndUpdate(busId, {
            latitude,
            longitude,
            lastUpdated: Date.now()
        });

        if (!bus) return res.status(404).json({ message: 'Bus not found' });

        res.status(200).json({ message: 'Location updated' });
    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ message: 'Failed to update location' });
    }
}
