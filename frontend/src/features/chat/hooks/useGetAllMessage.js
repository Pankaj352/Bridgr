import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector(store => store.auth);

    useEffect(() => {
        const getAllMessage = async () => {
            try {
                if (selectedUser) {
                    const res = await axios.get(
                        `https://bridgr.onrender.com/api/message/all/${selectedUser?._id}`,
                        { withCredentials: true }
                    );
                    if (res.data.success) {
                        dispatch(setMessages(res.data.messages));
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };
        getAllMessage();
    }, [selectedUser, dispatch]);
};

export default useGetAllMessage;