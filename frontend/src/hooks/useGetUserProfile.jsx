import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { API_ENDPOINTS } from '@/config/api';

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const res = await axios.get(
                  API_ENDPOINTS.GET_USER_PROFILE(userId),
                  { withCredentials: true }
                );
                if (res.data.success) { 
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
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