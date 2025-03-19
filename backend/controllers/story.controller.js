import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Story } from "../models/story.model.js";

export const createStory = async (req, res) => {
    try {
        const story = req.file;
        const authorId = req.id;

        if (!story) {
            return res.status(400).json({
                success: false,
                message: 'Story media is required'
            });
        }

        // Optimize and convert the image
        const optimizedImageBuffer = await sharp(story.buffer)
            .resize({ width: 1080, height: 1920, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // Convert buffer to data URI
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        
        // Upload to cloudinary
        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        // Create story in database
        const newStory = await Story.create({
            media: cloudResponse.secure_url,
            author: authorId
        });

        // Populate author details
        await newStory.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            success: true,
            message: 'Story created successfully',
            story: newStory
        });

    } catch (error) {
        console.error('Error creating story:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating story'
        });
    }
};

export const getStoryFeed = async (req, res) => {
    try {
        // Get stories from the last 24 hours
        const stories = await Story.find({
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).populate({
            path: 'author',
            select: '-password'
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories
        });

    } catch (error) {
        console.error('Error fetching story feed:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching story feed'
        });
    }
};