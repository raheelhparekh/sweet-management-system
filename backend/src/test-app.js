import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import sweetRoutes from "./routes/sweet.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/sweets", sweetRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Sweet Shop Test API is running...");
});

app.use(notFound);
app.use(errorHandler);

export default app;