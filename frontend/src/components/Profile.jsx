import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import useFollowUser from '@/hooks/useFollowUser';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const { followUser } = useFollowUser();

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = userProfile?.followers?.includes(user?._id);

  const handleFollow = async () => {
    try {
      await followUser(userId);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className='flex max-w-2xl justify-center mx-auto pl-10'>
      <div className='flex flex-col gap-20 p-8 w-full'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <section className='flex items-center justify-center md:col-span-1'>
            <Avatar className='h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section className='md:col-span-2'>
            <div className='flex flex-col gap-5'>
              <div className='flex flex-wrap items-center gap-2 md:gap-4'>
                <span className='text-xl md:text-2xl'>{userProfile?.username}</span>
                {
                  isLoggedInUserProfile ? (
                    <div className='flex flex-wrap gap-2 md:gap-4'>
                      <Link to="/account/edit"><Button variant='secondary' className='hover:bg-gray-200 h-8 md:h-9'>Edit profile</Button></Link>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8 md:h-9'>View archive</Button>
                      <Button variant='secondary' className='hover:bg-gray-200 h-8 md:h-9'>Ad tools</Button>
                    </div>
                  ) : (
                    isFollowing ? (
                      <div className='flex gap-2 md:gap-4'>
                        <Button variant='secondary' className='h-8 md:h-9' onClick={handleFollow}>Unfollow</Button>
                        <Button variant='secondary' className='h-8 md:h-9'>Message</Button>
                      </div>
                    ) : (
                      <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8 md:h-9' onClick={handleFollow}>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4 md:gap-8 text-sm md:text-base'>
                <p><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers.length} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following.length} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold text-sm md:text-base'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span> </Badge>
                <span className='text-sm md:text-base'>Awesome ✌️</span>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-10 text-xs md:text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer'>REELS</span>
            <span className='py-3 cursor-pointer'>TAGS</span>
          </div>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-1 md:gap-4'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer aspect-square'>
                    <img src={post.image} alt='postimage' className='w-full h-full object-cover' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile