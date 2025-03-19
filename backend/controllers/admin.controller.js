import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Story } from '../models/story.model.js';

// Get all users for admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users: ' + error.message
        });
    }
};

// Get admin statistics
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalStories = await Story.countDocuments();
        
        // Get active users (users who have posted in the last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = await Post.distinct('author', {
            createdAt: { $gte: sevenDaysAgo }
        }).countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalPosts,
                totalStories,
                activeUsers
            }
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics: ' + error.message
        });
    }
};

// Ban/Unban user
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { action } = req.params; // 'ban' or 'unban'

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isBanned = action === 'ban';
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`
        });
    } catch (error) {
        console.error(`Error ${req.params.action}ing user:`, error);
        res.status(500).json({
            success: false,
            message: `Error ${req.params.action}ing user: ${error.message}`
        });
    }
};

module.exports = {
    getAllUsers,
    getAdminStats,
    updateUserStatus
};