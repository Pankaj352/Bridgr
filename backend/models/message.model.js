import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    text: {
        type: String
    },
    fileUrl: {
        type: String
    },
    fileName: {
        type: String
    },
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            required: true,
            enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry']
        }
    }]
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);