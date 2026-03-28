import { jwtVerify } from "jose";

export function withRoleGuard(allowedRoles, next) {
  return async function getServerSideProps(context) {
    const token = context.req.cookies["pharmaos_token"];

    if (!token) {
      return {
        redirect: { destination: "/login", permanent: false },
      };
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
        return {
          redirect: { destination: "/dashboard", permanent: false },
        };
      }

      if (next) {
        return next(context, payload);
      }

      return { props: { user: payload } };
    } catch {
      return {
        redirect: { destination: "/login", permanent: false },
      };
    }
  };
}
