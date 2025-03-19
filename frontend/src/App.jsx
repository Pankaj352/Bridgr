import { useEffect } from 'react'
import ChatPage from './features/chat/components/ChatPage'
import EditProfile from './features/auth/components/EditProfile'
import Explore from './features/explore/components/Explore'
import Home from './components/Home'
import Login from './features/auth/components/Login'
import MainLayout from './components/MainLayout'
import Notifications from './features/notifications/components/Notifications'
import Profile from './components/Profile'
import Signup from './features/auth/components/Signup'
import Search from './features/search/components/Search'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { io } from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'
import { setSocketStatus } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import ProtectedRoutes from './components/ProtectedRoutes'
import PostDetail from './features/post/components/PostDetail'


const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: '/',
        element: <ProtectedRoutes><Home /></ProtectedRoutes>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoutes> <Profile /></ProtectedRoutes>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>
      },
      {
        path: '/chat',
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>
      },
      {
        path: '/notifications',
        element: <ProtectedRoutes><Notifications /></ProtectedRoutes>
      },
      {
        path: '/search',
        element: <ProtectedRoutes><Search /></ProtectedRoutes>
      },
      {
        path: '/explore',
        element: <ProtectedRoutes><Explore /></ProtectedRoutes>
      },
      {
        path: '/post/:id',
        element: <ProtectedRoutes><PostDetail /></ProtectedRoutes>
      },
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
])

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      const socketio = io('https://bridgr.onrender.com', {
        query: {
          userId: user?._id
        },
        transports: ['websocket']
      });

      // Update connection status in Redux
      dispatch(setSocketStatus(true));

      // listen all the events
      socketio.on('getOnlineUsers', (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      });

      socketio.on('disconnect', () => {
        dispatch(setSocketStatus(false));
      });

      socketio.on('connect', () => {
        dispatch(setSocketStatus(true));
      });

      return () => {
        socketio.close();
        dispatch(setSocketStatus(false));
      }
    } else {
      dispatch(setSocketStatus(null));
    }
  }, [user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
