import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@/redux/authSlice';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Bookmark = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(getProfile(user?._id));
    }, [dispatch, user?._id]);

    if (!user?.bookmarks?.length) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <p className="text-gray-500">No bookmarked posts yet</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Bookmarked Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user?.bookmarks?.map((post) => (
                    <Card 
                        key={post._id} 
                        className="cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => navigate(`/post/${post._id}`)}
                    >
                        <CardContent className="p-0">
                            <img 
                                src={post.image} 
                                alt="post" 
                                className="w-full h-64 object-cover"
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Bookmark;