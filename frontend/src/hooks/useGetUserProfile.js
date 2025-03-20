import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserProfile } from '@/redux/authSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';

const useGetUserProfile = (userId) => {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    API_ENDPOINTS.GET_USER_PROFILE(userId),
                    { withCredentials: true }
                );
                if (response.data.success) {
                    dispatch(setUserProfile(response.data.user));
                } else {
                    toast.error(data.message || 'Failed to fetch user profile');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Failed to fetch user profile');
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId, dispatch]);

    return { isLoading };
};

export default useGetUserProfile;