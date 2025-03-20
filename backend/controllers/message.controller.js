import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"

// for chatting
export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID is required'
            });
        }

        const messageData = {};

        if (req.file) {
            messageData.fileUrl = req.file.path;
            messageData.fileName = req.file.originalname;
        } else if (req.body.textMessage) {
            messageData.text = req.body.textMessage;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }
      
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            ...messageData
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
            await conversation.save();

            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }

            return res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                newMessage
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('messages');

        if (!conversation) return res.status(200).json({
            success: true,
            messages: []
        });

        const messages = conversation.messages;

        return res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const reactToMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.id;
        const { reactionType } = req.body;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        if (!reactionType || !['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid reaction type'
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Find existing reaction by this user
        const existingReactionIndex = message.reactions.findIndex(
            reaction => reaction.user.toString() === userId
        );

        if (existingReactionIndex !== -1) {
            // If same reaction type, remove it
            if (message.reactions[existingReactionIndex].type === reactionType) {
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Update reaction type
                message.reactions[existingReactionIndex].type = reactionType;
            }
        } else {
            // Add new reaction
            message.reactions.push({
                user: userId,
                type: reactionType
            });
        }

        await message.save();

        // Emit socket event for real-time updates
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageReaction", {
                messageId,
                reactions: message.reactions
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Reaction updated successfully',
            reactions: message.reactions
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.id;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if the user is the sender of the message
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        // Remove message from conversation
        await Conversation.updateMany(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Notify other user about message deletion
        const receiverSocketId = getReceiverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', { messageId });
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

>>>>>>> b6a14c5 (commit changes)
export const forwardMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const senderId = req.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                message: 'Receiver ID is required'
            });
        }

        const originalMessage = await Message.findById(messageId);
        if (!originalMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const forwardedMessage = await Message.create({
            senderId,
            receiverId,
            text: originalMessage.text,
            fileUrl: originalMessage.fileUrl,
            fileName: originalMessage.fileName,
            isForwarded: true
        });

        if (forwardedMessage) {
            conversation.messages.push(forwardedMessage._id);
            await conversation.save();

            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", forwardedMessage);
            }

            return res.status(200).json({
                success: true,
                message: 'Message forwarded successfully',
                forwardedMessage
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};