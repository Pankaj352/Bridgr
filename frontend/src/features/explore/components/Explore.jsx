import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { API_ENDPOINTS } from '@/config/api'

const Explore = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTrendingPosts = async () => {
            try {
                const res = await axios.get(
                    API_ENDPOINTS.GET_TRENDING_POSTS,
                    { withCredentials: true }
                )
                if (res.data.success) {
                    setPosts(res.data.posts)
                }
            } catch (error) {
                console.error('Error fetching trending posts:', error)
                setError('Failed to load trending posts')
            } finally {
                setLoading(false)
            }
        }

        fetchTrendingPosts()
    }, [])

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    if (error) {
        return (
            <div className='flex justify-center items-center min-h-screen text-red-500'>
                {error}
            </div>
        )
    }

    return (
        <div className=''>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <h1 className='text-3xl font-bold mb-8 text-gray-900'>Explore</h1>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {posts.map((post) => {
                        // Skip rendering if post or post.author is null/undefined
                        if (!post || !post.author) return null;

                        return (
                            <div key={post._id} className='relative group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300'>
                                <Link to={`/post/${post._id}`}>
                                    <div className='aspect-square overflow-hidden'>
                                        {post.image && (
                                            <img 
                                                src={post.image} 
                                                alt='post' 
                                                className='w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300'
                                            />
                                        )}
                                    </div>
                                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-300'>
                                        <div className='flex items-center space-x-6 text-white'>
                                            <div className='flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
                                                <Heart className='h-7 w-7 drop-shadow-lg' />
                                                <span className='text-lg font-semibold drop-shadow-lg'>{post.likes?.length || 0}</span>
                                            </div>
                                            <div className='flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300'>
                                                <MessageCircle className='h-7 w-7 drop-shadow-lg' />
                                                <span className='text-lg font-semibold drop-shadow-lg'>{post.comments?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                                <div className='p-3 border-t border-gray-100'>
                                    <Link 
                                        to={`/profile/${post.author._id}`}
                                        className='flex items-center gap-2 group/profile hover:text-gray-900'
                                    >
                                        <Avatar className='h-7 w-7 ring-2 ring-white'>
                                            <AvatarImage src={post.author.profilePicture} className='object-cover' />
                                            <AvatarFallback className='bg-gray-100 text-gray-600 text-xs'>
                                                {post.author.username ? post.author.username[0].toUpperCase() : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className='text-sm font-medium text-gray-700 group-hover/profile:text-gray-900 transition-colors duration-200'>
                                            {post.author.username || 'Unknown User'}
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

export default Explore