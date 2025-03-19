import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'

const MainLayout = () => {
  const location = useLocation();
  const shouldShowRightSidebar = !["/chat", "/explore", "/bookmarks"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <LeftSidebar />
      <div className={` ${shouldShowRightSidebar ? 'mr-[25%]' : ''} min-h-screen`}>
        <main className="w-[80%] ml-[20%]">
          <Outlet />
        </main>
      </div>
      {shouldShowRightSidebar && <RightSidebar />}
    </div>
  )
}

export default MainLayout