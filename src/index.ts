import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRoutes from "./routes/users";
import postsRoutes from "./routes/posts";
import authRoutes from "./routes/auth";
import likesRoutes from "./routes/likes";
import commentsRoutes from "./routes/comments";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { v2 as cloudinary } from "cloudinary";

// ✅ Load env variables
dotenv.config(); // Let Render handle .env injection — no path override needed

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS
const corsOptions = {
  origin: 'https://blogappfrontend-3owb.onrender.com',
  credentials: true,                    // allow cookies/auth headers
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));    // enable pre-flight for all routes

// ✅ Cloudinary check
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Missing Cloudinary environment variables!");
  process.exit(1); // Fail early to avoid timeout
}
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Static uploads (optional)
try {
  const uploadsPath = path.join(process.cwd(), "/uploads/");
  app.use("/uploads/", express.static(uploadsPath));
} catch (err) {
  console.warn("⚠️ Uploads folder missing, continuing without static upload route.");
}

// ✅ Routes
app.use("/posts", postsRoutes);
app.use("/posts", likesRoutes);
app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/comments", commentsRoutes);
app.use(errorMiddleware);

// Serve frontend build
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..','dist', 'index.html'));
});

// ✅ Start server
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
