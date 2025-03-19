import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    media: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Stories expire after 24 hours
});

export const Story = mongoose.model('Story', storySchema);