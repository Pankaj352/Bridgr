import React from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import Posts from '@/features/post/components/Posts';
import Stories from '@/features/story/components/Stories';

const Home = () => {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <LeftSidebar />
      <main className="flex-1 ml-[16%] mr-[25%] border-x border-gray-200 bg-white">
        <div className="max-w-[470px] mx-auto pt-6">
          <Stories />
          <Posts />
        </div>
      </main>
      <RightSidebar />
    </div>
  );
};

export default Home;