import React, { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(
                    'https://bridgr.onrender.com/api/user/notifications',
                    { withCredentials: true }
                )
                if (res.data.success) {
                    setNotifications(res.data.notifications)
                }
            } catch (error) {
                console.error('Error fetching notifications:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotifications()
    }, [])

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'like':
                return 'liked your post'
            case 'comment':
                return 'commented on your post'
            case 'follow':
                return 'started following you'
            default:
                return 'interacted with you'
        }
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    return (
        <div className='max-w-2xl mx-auto px-4 py-8'>
            <h1 className='text-2xl font-bold mb-6'>Notifications</h1>
            <div className='space-y-4'>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className='flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors'
                        >
                            <Link to={`/profile/${notification.from._id}`}>
                                <Avatar>
                                    <AvatarImage src={notification.from.profilePicture} />
                                    <AvatarFallback>UN</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className='flex-1'>
                                <p>
                                    <Link
                                        to={`/profile/${notification.from._id}`}
                                        className='font-semibold hover:underline'
                                    >
                                        {notification.from.username}
                                    </Link>{' '}
                                    {getNotificationText(notification)}
                                </p>
                                <p className='text-sm text-gray-500'>
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {notification.type === 'like' || notification.type === 'comment' ? (
                                <Link to={`/post/${notification.post}`}>
                                    <img
                                        src={notification.postImage}
                                        alt='Post'
                                        className='w-12 h-12 object-cover rounded'
                                    />
                                </Link>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <p className='text-center text-gray-500 py-4'>
                        No notifications yet
                    </p>
                )}
            </div>
        </div>
    )
}

export default Notifications