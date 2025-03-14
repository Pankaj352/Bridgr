import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

const Explore = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTrendingPosts = async () => {
            try {
                const res = await axios.get(
                    'https://bridgr.onrender.com/api/post/trending',
                    { withCredentials: true }
                )
                if (res.data.success) {
                    setPosts(res.data.posts)
                }
            } catch (error) {
                console.error('Error fetching trending posts:', error)
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

    return (
        <div className='max-w-7xl mx-auto px-4 py-8'>
            <h1 className='text-2xl font-bold mb-6'>Explore</h1>
            <div className='grid grid-cols-3 gap-1'>
                {posts.map((post) => (
                    <div key={post._id} className='relative group cursor-pointer'>
                        <Link to={`/post/${post._id}`}>
                            <img 
                                src={post.image} 
                                alt='post' 
                                className='w-full aspect-square object-cover'
                            />
                            <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                                <div className='flex items-center text-white space-x-4'>
                                    <div className='flex items-center gap-2'>
                                        <Heart className='h-6 w-6' />
                                        <span>{post.likes.length}</span>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <MessageCircle className='h-6 w-6' />
                                        <span>{post.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <div className='p-2'>
                            <Link 
                                to={`/profile/${post.author._id}`}
                                className='flex items-center gap-2'
                            >
                                <Avatar className='h-6 w-6'>
                                    <AvatarImage src={post.author.profilePicture} />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                                <span className='text-sm font-medium'>
                                    {post.author.username}
                                </span>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Explore