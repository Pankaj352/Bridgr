import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    likeNotification: [],
    commentNotification: [],
    followNotification: [],
    bookmarks: []
};

const realTimeNotificationSlice = createSlice({
    name: 'realTimeNotification',
    initialState,
    reducers: {
        setLikeNotification: (state, action) => {
            state.likeNotification = action.payload;
        },
        addLikeNotification: (state, action) => {
            state.likeNotification.push(action.payload);
        },
        setCommentNotification: (state, action) => {
            state.commentNotification = action.payload;
        },
        addCommentNotification: (state, action) => {
            state.commentNotification.push(action.payload);
        },
        setFollowNotification: (state, action) => {
            state.followNotification = action.payload;
        },
        addFollowNotification: (state, action) => {
            state.followNotification.push(action.payload);
        },
        setBookmarks: (state, action) => {
            state.bookmarks = action.payload;
        },
        addBookmark: (state, action) => {
            state.bookmarks.push(action.payload);
        },
        removeBookmark: (state, action) => {
            state.bookmarks = state.bookmarks.filter(bookmark => bookmark._id !== action.payload);
        },
        clearAllNotifications: (state) => {
            state.likeNotification = [];
            state.commentNotification = [];
            state.followNotification = [];
        }
    }
});

export const {
    setLikeNotification,
    addLikeNotification,
    setCommentNotification,
    addCommentNotification,
    setFollowNotification,
    addFollowNotification,
    setBookmarks,
    addBookmark,
    removeBookmark,
    clearAllNotifications
} = realTimeNotificationSlice.actions;

export default realTimeNotificationSlice.reducer;