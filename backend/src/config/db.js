import mongoose from "mongoose";
import logger from "../utils/logger.js";

mongoose.set("strictQuery", false);

if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", true);
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
