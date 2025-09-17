import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import sweetRoutes from "./routes/sweet.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

dotenv.config();
connectDB();

const app = express();

// Define allowed origins based on environment
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);

// Root route for API status check
app.get("/", (req, res) => {
  res.send("Sweet Shop API is running...");
});

app.use(notFound);
app.use(errorHandler);

export default app;
