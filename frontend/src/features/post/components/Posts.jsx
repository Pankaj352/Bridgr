import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setPosts } from '@/redux/postSlice';
import Post from './Post';

const Posts = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector(store => store.post);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('https://bridgr.onrender.com/api/post/feed', { withCredentials: true });
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchPosts();
  }, [dispatch]);

  return (
    <div className='w-full flex-1 flex justify-center'>
      <div className='w-full max-w-[600px] flex flex-col items-center gap-1 py-1'>
        {posts?.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Posts;