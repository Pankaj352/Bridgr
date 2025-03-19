import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();

    return (
        <div className='flex max-w-2xl mx-auto justify-center align-items-center'>
            <div className='flex-grow'>
                <Feed />
                <Outlet />
            </div>
        </div>
    )
}

export default Home