// routeRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const {
    getRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getPublicRoutes,
} = require('../controllers/routeController');

// ✅ Public route for fetching all routes for display on the map view.
router.get('/public', getPublicRoutes);

// 🔒 Protected admin routes for full CRUD operations on routes.
// Only users with 'admin' or 'super-admin' roles can access these.
router.get('/', authMiddleware, checkRole(['admin', 'super-admin']), getRoutes);
router.post('/', authMiddleware, checkRole(['admin', 'super-admin']), createRoute);
router.put('/:id', authMiddleware, checkRole(['admin', 'super-admin']), updateRoute);
router.delete('/:id', authMiddleware, checkRole(['admin', 'super-admin']), deleteRoute);

module.exports = router;
