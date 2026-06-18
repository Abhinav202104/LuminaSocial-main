import 'dotenv/config';          // Loads .env BEFORE any other imports
import express from "express";
import cors from "cors";
import path from "path";
import dbConnect from "./src/config/dbConnect.js";
import userRoutes from "./src/routes/userRoutes.route.js";
import authRoutes from "./src/routes/authRoutes.route.js";
import postRoutes from "./src/routes/postRoutes.route.js";
import messageRoutes from "./src/routes/messageRoutes.route.js";
import tagRoutes from "./src/routes/tagRoutes.route.js";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const app = express();
const server = createServer(app);

// ========== Socket.IO with dynamic CORS ==========
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests from any localhost port
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
dbConnect();

// ========== Middleware ==========
app.use(express.json());

// ========== Express CORS (dynamic) ==========
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from any localhost port
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ========== Routes ==========
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/tags", tagRoutes);

// ========== Socket.IO logic ==========
let users = [];

const addUser = (userId, socketId) => {
  if (!users.some((u) => u.userId === userId)) {
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((u) => u.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((u) => u.userId === userId);
};

io.on("connection", (socket) => {
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    console.log("User connected:", userId);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const sender = getUser(senderId);
    const receiver = getUser(receiverId);
    const payload = { senderId, receiverId, text };

    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", payload);
      console.log(`Message sent from ${senderId} to ${receiverId}`);
    }

    if (sender) {
      io.to(sender.socketId).emit("getMessage", payload);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User disconnected:", socket.id);
  });
});

// ========== Start server ==========
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});