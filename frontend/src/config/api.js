// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://bridgr.onrender.com'
    : 'http://localhost:8000';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/api/user/login`,
    SIGNUP: `${API_BASE_URL}/api/user/register`,
    LOGOUT: `${API_BASE_URL}/api/user/logout`,
    EDIT_PROFILE: `${API_BASE_URL}/api/user/profile/edit`,
    
    // User endpoints
    GET_USER_PROFILE: (userId) => `${API_BASE_URL}/api/user/${userId}/profile`,
    GET_SUGGESTED_USERS: `${API_BASE_URL}/api/user/suggested`,
    SEARCH_USERS: `${API_BASE_URL}/api/user/search`,
    FOLLOW_UNFOLLOW: (userId) => `${API_BASE_URL}/api/user/followorunfollow/${userId}`,
    
    // Post endpoints
    CREATE_POST: `${API_BASE_URL}/api/post/addpost`,
    GET_ALL_POSTS: `${API_BASE_URL}/api/post/all`,
    GET_USER_POSTS: `${API_BASE_URL}/api/post/userpost/all`,
    GET_TRENDING_POSTS: `${API_BASE_URL}/api/post/trending`,
    LIKE_POST: (postId) => `${API_BASE_URL}/api/post/${postId}/like`,
    DISLIKE_POST: (postId) => `${API_BASE_URL}/api/post/${postId}/dislike`,
    ADD_COMMENT: (postId) => `${API_BASE_URL}/api/post/${postId}/comment`,
    GET_COMMENTS: (postId) => `${API_BASE_URL}/api/post/${postId}/comment/all`,
    DELETE_POST: (postId) => `${API_BASE_URL}/api/post/delete/${postId}`,
    BOOKMARK_POST: (postId) => `${API_BASE_URL}/api/post/${postId}/bookmark`,
    
    // Message endpoints
    SEND_MESSAGE: (receiverId) => `${API_BASE_URL}/api/message/send/${receiverId}`,
    GET_ALL_MESSAGES: (userId) => `${API_BASE_URL}/api/message/all/${userId}`,
    REACT_TO_MESSAGE: (messageId) => `${API_BASE_URL}/api/message/react/${messageId}`,
    FORWARD_MESSAGE: (messageId) => `${API_BASE_URL}/api/message/forward/${messageId}`,
    
    // Story endpoints
    GET_STORY_FEED: `${API_BASE_URL}/api/story/feed`,
    CREATE_STORY: `${API_BASE_URL}/api/story/create`,
    
    // Admin endpoints
    ADMIN_GET_USERS: `${API_BASE_URL}/api/admin/users`,
    ADMIN_GET_STATS: `${API_BASE_URL}/api/admin/stats`,
    ADMIN_USER_ACTION: (userId, action) => `${API_BASE_URL}/api/admin/users/${userId}/${action}`,
    
    // Notification endpoints
    GET_NOTIFICATIONS: `${API_BASE_URL}/api/notification`,
    READ_NOTIFICATION: (notificationId) => `${API_BASE_URL}/api/notification/${notificationId}/read`,
    READ_ALL_NOTIFICATIONS: `${API_BASE_URL}/api/notification/read/all`,

    // Socket connection
    SOCKET_URL: API_BASE_URL
};