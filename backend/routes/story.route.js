import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { createStory, getStoryFeed } from "../controllers/story.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, upload.single('story'), createStory);
router.route("/feed").get(isAuthenticated, getStoryFeed);

export default router;