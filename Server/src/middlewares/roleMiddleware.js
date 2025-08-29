// middlewares/roleMiddleware.js

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        // req.user is populated by authMiddleware.js
        if (!req.user || !req.user.role) {
            return res.status(401).json({ message: 'Authorization denied. No role provided.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden. You do not have the required permissions.' });
        }
        next();
    };
};

module.exports = roleMiddleware;