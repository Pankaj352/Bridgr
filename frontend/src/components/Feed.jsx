import React from 'react'
import Posts from '@/features/post/components/Posts'

const Feed = () => {
  return (
    <div className='flex-1 my-8 flex flex-col items-center pl-[20%]'>
        <Posts/>
    </div>
  )
}

export default Feed