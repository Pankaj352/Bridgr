import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://bridgr.onrender.com/api/post/${id}`, { withCredentials: true });
        if (res.data.success) {
          setPost(res.data.post);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!post) return <div className="flex justify-center items-center h-screen">Post not found</div>;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 max-w-[100vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarImage src={post.user?.profilePicture} alt={post.user?.username} />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm sm:text-base">{post.user?.username}</h2>
              <p className="text-xs sm:text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {post.image && (
          <div className="relative pt-[100%] sm:pt-[75%] md:pt-[66.67%]">
            <img
              src={post.image}
              alt="post"
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-3 sm:p-4">
          <p className="text-sm sm:text-base">{post.caption}</p>
          <div className="mt-3 sm:mt-4 flex items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-500">
            <span>{post.likes?.length || 0} likes</span>
            <span>{post.comments?.length || 0} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;