import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import logger from "./utils/logger.js";
import ApiError from "./utils/ApiError.js";
import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
import parapharmacyRoutes from "./routes/parapharmacy.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import orderRoutes from "./routes/order.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import reservationRoutes from "./routes/reservation.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import reportRoutes from "./routes/report.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import { setIO, submitResponse } from "./services/pharmacistGate.service.js";
import { startNearExpiryJob } from "./jobs/nearExpiry.job.js";
import { startReservationExpiryJob } from "./jobs/reservationExpiry.job.js";

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  "https://pharmacy-management-system-one-drab.vercel.app",
  "https://pharmaos-reservations.vercel.app",
  "https://customer-portal-lovat-beta.vercel.app",
  "https://customer-portal-8sg6f6tbs-imaneboughamzas-projects.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/parapharmacy", parapharmacyRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/customers", customerRoutes);

app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.path}`));
});

app.use((err, req, res, next) => {
  logger.error(
    `${err.statusCode || 500} - ${err.message} - ${req.method} ${req.path}`,
  );

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [{ field, message: `${field} already exists` }],
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  }

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);
setIO(io);

io.on("connection", (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);

  socket.on("join_pharmacy", ({ pharmacyId, userId, role }) => {
    socket.join(`pharmacy:${pharmacyId}`);
    if (role === "pharmacist") {
      socket.join(`pharmacists:${pharmacyId}`);
      logger.debug(`Pharmacist ${userId} joined pharmacy room ${pharmacyId}`);
    }
  });

  socket.on("join_pharmacists", () => {
    socket.join("pharmacists");
    logger.debug(`Socket ${socket.id} joined legacy pharmacists room`);
  });

  socket.on(
    "GATE_SUBMIT_RESPONSE",
    ({ requestId, approved, pharmacistId, reason }) => {
      submitResponse(io, requestId, approved, pharmacistId, reason);
    },
  );

  socket.on("disconnect", () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await connectRedis();

  startNearExpiryJob();
  startReservationExpiryJob();

  httpServer.listen(PORT, () => {
    logger.info(
      `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
};

start();

process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
