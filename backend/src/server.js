import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { setIO } from "./services/pharmacistGate.service.js";
import { startNearExpiryJob } from "./jobs/nearExpiry.job.js";
import { startReservationExpiryJob } from "./jobs/reservationExpiry.job.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

// Connect to databases
await connectDB(process.env.MONGO_URI);
connectRedis();

// Create Express app + HTTP server
const app = createApp();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

// Inject io into the pharmacist gate service
setIO(io);

io.on("connection", (socket) => {
  logger.info(`[socket] Client connected: ${socket.id}`);

  // Pharmacist joins their approval room
  socket.on("join_pharmacists", () => {
    socket.join("pharmacists");
    logger.info(`[socket] ${socket.id} joined pharmacists room`);
  });

  socket.on("disconnect", () => {
    logger.info(`[socket] Client disconnected: ${socket.id}`);
  });
});

// Cron jobs
startNearExpiryJob();
startReservationExpiryJob();

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 API running on http://localhost:${PORT}`);
});
