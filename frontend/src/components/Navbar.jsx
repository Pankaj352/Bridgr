import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Home, Search, PlusSquare, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { clearUnreadCount } from '@/redux/rtnSlice';

const Navbar = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { notifications, unreadCount } = useSelector(state => state.notification);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
        if (unreadCount > 0) {
            dispatch(clearUnreadCount());
        }
    };

    return (
        <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold">Bridgr</Link>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <Link to="/"><Home className="h-6 w-6" /></Link>
                        <Link to="/search"><Search className="h-6 w-6" /></Link>
                        <Link to="/create"><PlusSquare className="h-6 w-6" /></Link>
                        <Link to="/chat"><MessageCircle className="h-6 w-6" /></Link>
                        
                        <div className="relative">
                            <Button 
                                variant="ghost" 
                                className="relative" 
                                onClick={handleNotificationClick}
                            >
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notification, index) => (
                                            <div key={index} className="px-4 py-2 hover:bg-gray-100 flex items-center space-x-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={notification.sender?.profilePicture} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="text-sm">
                                                        <span className="font-semibold">{notification.sender?.username}</span>
                                                        {' '}{notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-gray-500 text-center">No notifications</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link to={`/profile/${user?._id}`}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.profilePicture} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;