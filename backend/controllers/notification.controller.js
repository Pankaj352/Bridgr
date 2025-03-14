import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.id })
            .populate('sender', 'username profilePicture')
            .populate('post', 'image')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                message: "Notification not found",
                success: false
            });
        }

        if (notification.recipient.toString() !== req.id) {
            return res.status(403).json({
                message: "Not authorized",
                success: false
            });
        }

        notification.read = true;
        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.id, read: false },
            { read: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};