import React from "react";
import Posts from "@/features/post/components/Posts";
import Stories from "@/features/story/components/Stories";

const Feed = () => {
  return (
    <>
      <div className="w-full flex flex-col">
        <Stories />
      </div>
      <div className="flex-1 my-4 flex flex-col items-center px-4 sm:px-6 md:px-8">
        <Posts />
      </div>
    </>
  );
};

export default Feed;
