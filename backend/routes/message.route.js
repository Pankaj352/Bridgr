import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage, reactToMessage, forwardMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/all/:id').get(isAuthenticated, getMessage);
router.route('/react/:id').post(isAuthenticated, reactToMessage);
router.route('/forward/:id').post(isAuthenticated, forwardMessage);
 
export default router;