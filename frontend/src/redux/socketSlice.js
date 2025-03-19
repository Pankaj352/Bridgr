import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name:"socketio",
    initialState:{
        isConnected: false,
        lastError: null
    },
    reducers:{
        // actions
        setSocketStatus:(state, action) => {
            state.isConnected = action.payload;
        },
        setSocketError:(state, action) => {
            state.lastError = action.payload;
        }
    }
});
export const { setSocketStatus, setSocketError } = socketSlice.actions;
export default socketSlice.reducer;