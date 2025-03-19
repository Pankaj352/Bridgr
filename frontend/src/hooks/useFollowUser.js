import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setUserProfile, setSuggestedUsers } from '@/redux/authSlice';
import { API_ENDPOINTS } from '@/config/api';

const useFollowUser = () => {
    const dispatch = useDispatch();

    const followUser = async (userId) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.FOLLOW_UNFOLLOW(userId),
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                // Refetch user profile to update followers/following count
                const profileResponse = await axios.get(
                    API_ENDPOINTS.GET_USER_PROFILE(userId),
                    { withCredentials: true }
                );

                if (profileResponse.data.success) {
                    dispatch(setUserProfile(profileResponse.data.user));
                }

                // Update suggested users list by removing the followed user
                const suggestedResponse = await axios.get(
                    "https://bridgr.onrender.com/api/user/suggested",
                    { withCredentials: true }
                );

                if (suggestedResponse.data.success) {
                    dispatch(setSuggestedUsers(suggestedResponse.data.users));
                }

                return response.data;
            }
        } catch (error) {
            console.error('Error following/unfollowing user:', error);
            throw error;
        }
    };

    return { followUser };
};

export default useFollowUser;