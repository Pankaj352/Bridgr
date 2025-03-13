import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./socket/socket.js";
import path from "path";

dotenv.config();

// Checking if MONGO_URI is loaded correctly
console.log("MONGO_URI:", process.env.MONGO_URI);

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.URL,
  credentials: true,
};
app.use(cors(corsOptions));

// API Routes
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);
app.use("/api/message", messageRoute);

// Serving frontend
app.use(express.static(path.join(__dirname, "/frontend/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// Connect to Database and Start Server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
  });
