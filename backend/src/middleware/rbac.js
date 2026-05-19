import ApiError from "../utils/ApiError.js";

export const allow = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied - required role: ${roles.join(" or ")}`));
    }

    next();
  };
};

export const requireRole = allow;

export default allow;
