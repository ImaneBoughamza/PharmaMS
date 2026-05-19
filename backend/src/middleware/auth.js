import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { getRedis } from "../config/redis.js";
import User from "../models/User.model.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const redis = getRedis();

    if (redis) {
      const isBlacklisted = await redis.get(`session:${token}`);
      if (isBlacklisted) {
        throw ApiError.unauthorized("Token has been invalidated - please log in again");
      }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId ?? decoded.sub;

    const user = await User.findById(userId).select("mustChangePassword isActive");
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Account is deactivated");
    }
    if (user.mustChangePassword && !["/change-password", "/me"].includes(req.path)) {
      throw ApiError.unauthorized("Password reset required - please log in again");
    }

    req.user = {
      userId,
      sub: userId,
      pharmacyId: decoded.pharmacyId ?? null,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = auth;
export default auth;
