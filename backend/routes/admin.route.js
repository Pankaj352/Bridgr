import express from 'express';
import { getAllUsers, getAdminStats, updateUserStatus } from '../controllers/admin.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin only.'
        });
    }
    next();
};

// Protected admin routes
router.get('/users', isAuthenticated, isAdmin, getAllUsers);
router.get('/stats', isAuthenticated, isAdmin, getAdminStats);
router.post('/users/:userId/:action', isAuthenticated, isAdmin, updateUserStatus);

export default router;