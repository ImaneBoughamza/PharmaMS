import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    if (err.name === "ZodError") {
      return res.status(400).json({ message: "Validation error", issues: err.issues });
    }
    res.status(500).json({ message: "Server error" });
  });

  return app;
}
