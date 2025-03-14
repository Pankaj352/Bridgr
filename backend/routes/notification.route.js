import express from "express";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/notification.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route('/').get(isAuthenticated, getNotifications);
router.route('/:id/read').post(isAuthenticated, markNotificationAsRead);
router.route('/read/all').post(isAuthenticated, markAllNotificationsAsRead);

export default router;