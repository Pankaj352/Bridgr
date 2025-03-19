import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance from '@/config/axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from '@/components/ui/badge'

const Post = ({ post }) => {
    // Add null check at the beginning
    if (!post || !post.author) {
        return null; // Or return a placeholder/loading state
    }

    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axiosInstance.get(
              `/api/post/${post._id}/${action}`
            );
            console.log(res.data);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const commentHandler = async () => {
        try {
            if (!text.trim()) return;
            const res = await axiosInstance.post(`/api/post/${post._id}/comment`, { text: text.trim() });
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error(error.response?.data?.message || 'Failed to post comment');
        }
    }

    const deletePostHandler = async () => {
        try {
            const res = await axiosInstance.delete(`/api/post/delete/${post?._id}`)
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
            const res = await axiosInstance.get(`/api/post/${post?._id}/bookmark`
            );
            if(res.data.success){
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, isBookmarked: !p.isBookmarked } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error('Error bookmarking post:', error);
            toast.error(error.response?.data?.message || 'Failed to bookmark post');
        }
    }
    return (
        <div className='mb-6 w-full max-w-[600px] mx-auto bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300'>
            <div className='flex items-center justify-between px-4 py-3'>
                <div className='flex items-center gap-3'>
                    <Avatar className='w-8 h-8 ring-2 ring-gray-100'>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className='text-sm font-semibold hover:text-gray-600 transition-colors'>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary" className='text-[10px]'>Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center p-0 rounded-xl overflow-hidden">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-full text-[#ED4956] font-bold py-3 border-b hover:bg-gray-50">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-full py-3 border-b hover:bg-gray-50">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-full text-[#ED4956] py-3 hover:bg-gray-50">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <div className='relative pt-[120%]'>
                <img
                    className='absolute top-0 left-0 w-full h-full object-cover'
                    src={post.image}
                    alt="post_img"
                />
            </div>

            <div className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-4'>
                        {
                            liked ? 
                            <FaHeart 
                                onClick={likeOrDislikeHandler} 
                                size={24} 
                                className='cursor-pointer text-[#ED4956] transition-transform hover:scale-110 active:scale-90' 
                            /> : 
                            <FaRegHeart 
                                onClick={likeOrDislikeHandler} 
                                size={24} 
                                className='cursor-pointer hover:text-gray-600 transition-colors' 
                            />
                        }

                        <MessageCircle 
                            size={24} 
                            onClick={() => {
                                dispatch(setSelectedPost(post));
                                setOpen(true);
                            }} 
                            className='cursor-pointer hover:text-gray-600 transition-colors' 
                        />
                        <Send size={24} className='cursor-pointer hover:text-gray-600 transition-colors' />
                    </div>
                    <Bookmark 
                        onClick={bookmarkHandler} 
                        size={24} 
                        className='cursor-pointer hover:text-gray-600 transition-colors' 
                    />
                </div>
                <span className='font-semibold block mb-2 text-sm'>{postLike} likes</span>
                <p className='text-sm mb-1 leading-normal'>
                    <span className='font-semibold mr-2'>{post.author?.username}</span>
                    {post.caption}
                </p>
                {
                    comment.length > 0 && (
                        <span 
                            onClick={() => {
                                dispatch(setSelectedPost(post));
                                setOpen(true);
                            }} 
                            className='cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors'
                        >
                            View all {comment.length} comments
                        </span>
                    )
                }
                <CommentDialog open={open} setOpen={setOpen} />
                <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-100'>
                    <input
                        type="text"
                        placeholder='Add a comment...'
                        value={text}
                        onChange={changeEventHandler}
                        className='outline-none text-sm w-full placeholder:text-gray-400'
                    />
                    {
                        text && 
                        <span 
                            onClick={commentHandler} 
                            className='text-[#0095F6] font-semibold cursor-pointer text-sm hover:text-[#1877F2] transition-colors'
                        >
                            Post
                        </span>
                    }

                </div>
            </div>
        </div>
    )
}

export default Post