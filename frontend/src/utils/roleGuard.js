import { getServerAuthUser } from "./serverAuth";

export function withRoleGuard(allowedRoles, next) {
  return async function getServerSideProps(context) {
    const user = await getServerAuthUser(context);

    if (!user) {
      return {
        redirect: { destination: "/login", permanent: false },
      };
    }

    if (user.mustChangePassword) {
      return {
        redirect: { destination: "/profile", permanent: false },
      };
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        redirect: { destination: "/dashboard", permanent: false },
      };
    }

    if (next) {
      return next(context, user);
    }

    return { props: { user } };
  };
}
