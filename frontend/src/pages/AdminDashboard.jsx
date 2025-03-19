import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

const AdminDashboard = () => {
    const { user } = useSelector(store => store.auth);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalStories: 0,
        activeUsers: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check if user is admin
    if (!user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [usersRes, statsRes] = await Promise.all([
                    axios.get(API_ENDPOINTS.ADMIN_GET_USERS, { withCredentials: true }),
                    axios.get(API_ENDPOINTS.ADMIN_GET_STATS, { withCredentials: true })
                ]);

                if (usersRes.data.success) {
                    setUsers(usersRes.data.users);
                }

                if (statsRes.data.success) {
                    setStats(statsRes.data.stats);
                }
            } catch (error) {
                console.error('Error fetching admin data:', error);
                toast.error('Failed to fetch admin data');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
        // Refresh data every 5 minutes
        const interval = setInterval(fetchAdminData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleUserStatusChange = async (userId, action) => {
        try {
            const res = await axios.post(
                API_ENDPOINTS.ADMIN_USER_ACTION(userId, action),
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                setUsers(users.map(user => 
                    user._id === userId 
                        ? { ...user, status: action === 'ban' ? 'banned' : 'active' }
                        : user
                ));
                toast.success(`User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`);
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            toast.error(`Failed to ${action} user`);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-2xl">{stats.totalUsers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Posts</h3>
                    <p className="text-2xl">{stats.totalPosts}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Stories</h3>
                    <p className="text-2xl">{stats.totalStories}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Active Users</h3>
                    <p className="text-2xl">{stats.activeUsers}</p>
                </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-4 border-b">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={user.profilePicture}
                                                alt={user.username}
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {user.status === 'active' ? (
                                            <button
                                                onClick={() => handleUserStatusChange(user._id, 'ban')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Ban
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleUserStatusChange(user._id, 'unban')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Unban
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;