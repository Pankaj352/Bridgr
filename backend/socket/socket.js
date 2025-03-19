import {Server} from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: process.env.NODE_ENV === 'production'
            ? 'https://bridgr.onrender.com'
            : ['http://localhost:5173', 'http://localhost:8000'],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
    }
})

const userSocketMap = {} ; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle notifications
    socket.on('sendNotification', ({ receiverId, type, postId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('getNotification', {
                sender: userId,
                type,
                postId,
                createdAt: new Date()
            });
        }
    });

    // Handle typing status
    socket.on('typing', ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userTyping', { senderId: userId });
        }
    });

    socket.on('stopTyping', ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('userStoppedTyping', { senderId: userId });
        }
    });

    // Handle message delivery status
    socket.on('messageDelivered', ({ messageId, senderId }) => {
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageStatus', {
                messageId,
                status: 'delivered'
            });
        }
    });

    socket.on('messageRead', ({ messageId, senderId }) => {
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit('messageStatus', {
                messageId,
                status: 'read'
            });
        }
    });

    // WebRTC Signaling
    socket.on('callUser', ({ receiverId, signalData, callType }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('incomingCall', {
                callerId: userId,
                callerSocketId: socket.id,
                signalData,
                callType
            });
        }
    });

    socket.on('answerCall', ({ receiverId, answer }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('callAccepted', { answer });
        }
    });

    socket.on('declineCall', ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('callDeclined');
        }
    });

    socket.on('endCall', ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('callEnded');
        }
    });

    socket.on('iceCandidate', ({ receiverId, candidate }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('iceCandidate', { candidate });
        }
    });

    socket.on('disconnect',()=>{
        if(userId){
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
})

export {app, server, io};