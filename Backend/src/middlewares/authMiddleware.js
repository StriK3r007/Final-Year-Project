const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user from the database using the ID from the token
        const user = await User.findById(decoded.id).select('-password'); // Exclude password for security

        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Token might be valid but user doesn't exist
        }

        req.user = user; // Attach the fetched user object to the request
        next();
    } catch (error) {
        console.error('Token verification error:', error); // Log the error for debugging
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;