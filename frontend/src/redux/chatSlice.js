import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name:"chat",
    initialState:{
        onlineUsers:[],
        messages:[],
        socketConnected: false,
        socketId: null
    },
    reducers:{
        // actions
        setOnlineUsers:(state,action) => {
            state.onlineUsers = action.payload;
        },
        setMessages:(state,action) => {
            state.messages = action.payload;
        },
        setSocketStatus:(state,action) => {
            state.socketConnected = action.payload;
        },
        setSocketId:(state,action) => {
            state.socketId = action.payload;
        }
    }
});
export const {setOnlineUsers, setMessages} = chatSlice.actions;
export default chatSlice.reducer;