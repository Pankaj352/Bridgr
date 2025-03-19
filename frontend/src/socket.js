import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
    if (!socket) {
        socket = io('https://bridgr.onrender.com', {
            query: { userId },
            transports: ['websocket'],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Socket connection event handlers
        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Call-related event handlers
        socket.on('incomingCall', (data) => {
            console.log('Incoming call:', data);
        });

        socket.on('callAccepted', (data) => {
            console.log('Call accepted:', data);
        });

        socket.on('callDeclined', () => {
            console.log('Call declined');
        });

        socket.on('callEnded', () => {
            console.log('Call ended');
        });

        socket.on('iceCandidate', (data) => {
            console.log('Received ICE candidate:', data);
        });
    }
    return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
};

export const emitEvent = (eventName, data) => {
    if (socket) {
        socket.emit(eventName, data);
    }
};

export const onEvent = (eventName, callback) => {
    if (socket) {
        socket.on(eventName, callback);
    }
};

export const offEvent = (eventName, callback) => {
    if (socket) {
        socket.off(eventName, callback);
    }
};
