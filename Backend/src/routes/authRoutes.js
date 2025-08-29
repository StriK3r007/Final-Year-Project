// * working Code
const express = require('express');
const { registerUser, loginUser, updateUser, deleteUser, getLoggedInUser, getAllUsers, changePassword } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Make sure the path to your middleware is correct

// User registration and login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes with a more specific path should be defined before general ones
router.put('/change-password', authMiddleware, changePassword);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Routes for getting user data
router.get('/me', authMiddleware, getLoggedInUser); // New route to get logged-in user
router.get('/users', getAllUsers); // Only for admins ideally


module.exports = router;