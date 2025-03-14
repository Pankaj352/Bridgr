import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from '@/features/post/components/CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const { likeNotification, commentNotification, followNotification, bookmarks } = useSelector(store => store.realTimeNotification);
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const totalNotifications = likeNotification.length + commentNotification.length + followNotification.length;

    const logoutHandler = async () => {
        try {
            const res = await axios.get(
              "https://bridgr.onrender.com/api/user/logout",
              { withCredentials: true }
            );
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Search') {
            navigate("/search");
        } else if (textType === 'Explore') {
            navigate("/explore");
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        { icon: <Bookmark />, text: "Bookmarks" },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>Bridgr</h1>
                <div>
                    {
                        sidebarItems.map((item, index) => {
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                    {item.icon}
                                    <span>{item.text}</span>
                                    {
                                        item.text === "Notifications" && totalNotifications > 0 && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">{totalNotifications}</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="space-y-4">
                                                        {likeNotification.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Likes</h3>
                                                                {likeNotification.map((notification) => (
                                                                    <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                        <Avatar>
                                                                            <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                            <AvatarFallback>CN</AvatarFallback>
                                                                        </Avatar>
                                                                        <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> liked your post</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {commentNotification.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Comments</h3>
                                                                {commentNotification.map((notification) => (
                                                                    <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                        <Avatar>
                                                                            <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                            <AvatarFallback>CN</AvatarFallback>
                                                                        </Avatar>
                                                                        <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> commented on your post</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {followNotification.length > 0 && (
                                                            <div>
                                                                <h3 className="font-semibold mb-2">Follows</h3>
                                                                {followNotification.map((notification) => (
                                                                    <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                        <Avatar>
                                                                            <AvatarImage src={notification.userDetails?.profilePicture} />
                                                                            <AvatarFallback>CN</AvatarFallback>
                                                                        </Avatar>
                                                                        <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> started following you</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {totalNotifications === 0 && <p>No new notifications</p>}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            <CreatePost open={open} setOpen={setOpen} />

        </div>
    )
}

export default LeftSidebar