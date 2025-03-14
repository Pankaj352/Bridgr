import React from 'react'
import { useSelector } from 'react-redux'
import Post from './Post'

const Explore = () => {
    const { posts } = useSelector(store => store.post);
    const trendingPosts = posts.sort((a, b) => b.likes.length - a.likes.length);

    return (
        <div className='flex-1 my-8 flex flex-col items-center pl-[20%]'>
            <div className='w-full max-w-2xl px-4'>
                <h2 className='text-2xl font-bold mb-6'>Trending Posts</h2>
                <div className='space-y-6'>
                    {trendingPosts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Explore