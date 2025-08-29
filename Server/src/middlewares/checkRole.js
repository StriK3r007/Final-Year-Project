const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied, insufficient permissions' });
        }
        next(); // If the user has a valid role, proceed to the next middleware or route handler
    };
};

module.exports = checkRole;