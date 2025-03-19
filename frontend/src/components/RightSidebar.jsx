import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import useFollowUser from '@/hooks/useFollowUser'
import { Link } from 'react-router-dom'

const RightSidebar = () => {
    const { user, suggestedUsers } = useSelector(store => store.auth);
    const { followUser } = useFollowUser();

    const handleFollow = async (userId) => {
        try {
            await followUser(userId);
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    return (
        <div className='hidden lg:block w-[25%] fixed top-0 right-0 h-screen p-6 overflow-y-auto'>
            <div className='flex items-center gap-3 mb-8'>
                <Link to={`/profile/${user?._id}`}>
                    <Avatar className='w-12 h-12 border border-gray-200 hover:opacity-90 transition-opacity'>
                        <AvatarImage src={user?.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </Link>
                <div className='flex flex-col'>
                    <Link to={`/profile/${user?._id}`} className='font-semibold text-sm hover:opacity-80 transition-opacity'>
                        {user?.username}
                    </Link>
                    <span className='text-gray-500 text-sm truncate max-w-[150px]'>{user?.bio || 'Bio here...'}</span>
                </div>
            </div>

            <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-gray-500 font-semibold text-sm'>Suggested for you</h2>
                <button className='text-xs font-semibold hover:text-gray-500 transition-colors'>See All</button>
            </div>

            <div className='space-y-4'>
                {suggestedUsers?.slice(0, 5).map((suggestedUser) => (
                    <div key={suggestedUser._id} className='flex items-center justify-between group'>
                        <div className='flex items-center gap-3'>
                            <Link to={`/profile/${suggestedUser._id}`}>
                                <Avatar className='w-9 h-9 border border-gray-200 hover:opacity-90 transition-opacity'>
                                    <AvatarImage src={suggestedUser.profilePicture} />
                                    <AvatarFallback>CN</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className='flex flex-col'>
                                <Link 
                                    to={`/profile/${suggestedUser._id}`}
                                    className='font-semibold text-sm hover:underline'
                                >
                                    {suggestedUser.username}
                                </Link>
                                <span className='text-gray-500 text-xs'>Suggested for you</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleFollow(suggestedUser._id)}
                            variant='ghost'
                            className='text-[#0095F6] hover:text-blue-700 font-semibold text-xs h-auto p-0 opacity-0 group-hover:opacity-100 transition-opacity opacity-1'
                        >
                            Follow
                        </Button>
                    </div>
                ))}
            </div>

            <div className='mt-8 space-y-4'>
                <nav className='flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400'>
                    <a href="#" className='hover:underline'>About</a>
                    <a href="#" className='hover:underline'>Help</a>
                    <a href="#" className='hover:underline'>Press</a>
                    <a href="#" className='hover:underline'>API</a>
                    <a href="#" className='hover:underline'>Jobs</a>
                    <a href="#" className='hover:underline'>Privacy</a>
                    <a href="#" className='hover:underline'>Terms</a>
                    <a href="#" className='hover:underline'>Locations</a>
                </nav>
                <p className='text-xs text-gray-400'>&copy; 2024 BRIDGR</p>
            </div>
        </div>
    )
}

export default RightSidebar