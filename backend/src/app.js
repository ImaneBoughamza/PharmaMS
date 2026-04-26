import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import medicineRoutes from "./routes/medicine.routes.js";
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

import { ApiError } from "./utils/ApiError.js";
import logger from "./utils/logger.js";

export function createApp() {
  const app = express();

  // Security + parsing
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // Health check
  app.get("/health", (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/medicines", medicineRoutes);
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

  // 404
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
  });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(err);

    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Validation error", issues: err.issues });
    }
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
