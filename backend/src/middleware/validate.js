import { ZodError } from "zod";
import ApiError from "../utils/ApiError.js";

function schemaShape(schema) {
  const shape = schema?._def?.shape;
  if (typeof shape === "function") return shape();
  return schema?.shape ?? null;
}

function isEnvelopeSchema(schema) {
  const shape = schemaShape(schema);
  return Boolean(shape && (shape.body || shape.query || shape.params));
}

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (isEnvelopeSchema(schema)) {
        const parsed = schema.parse({
          body: req.body,
          query: req.query,
          params: req.params,
        });

        req.body = parsed.body || req.body;
        req.query = parsed.query || req.query;
        req.params = parsed.params || req.params;
        next();
        return;
      }

      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => {
          const path = e.path[0] === "body" || e.path[0] === "query" || e.path[0] === "params"
            ? e.path.slice(1)
            : e.path;

          return {
            field: path.join("."),
            message: e.message,
          };
        });

        return next(ApiError.badRequest("Validation failed", errors));
      }

      next(err);
    }
  };
};

export default validate;
