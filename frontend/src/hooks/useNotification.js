import { useDispatch } from 'react-redux';
import { setLikeNotification } from '@/redux/rtnSlice';
import axios from 'axios';

const useNotification = () => {
    const dispatch = useDispatch();

    const getNotifications = async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.GET_NOTIFICATIONS);
            if (data.success) {
                dispatch(setLikeNotification(data.notifications));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const { data } = await axios.post(API_ENDPOINTS.READ_NOTIFICATION(notificationId));
            if (data.success) {
                getNotifications(); // Refresh notifications after marking as read
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { data } = await axios.post(API_ENDPOINTS.READ_ALL_NOTIFICATIONS);
            if (data.success) {
                getNotifications(); // Refresh notifications after marking all as read
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return { getNotifications, markAsRead, markAllAsRead };
};

export default useNotification;