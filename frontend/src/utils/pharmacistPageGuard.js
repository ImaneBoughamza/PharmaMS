import { PHARMACIST } from "@/constants/roles";
import { getServerAuthUser } from "@/utils/serverAuth";

export function pharmacistOnlyProps(next) {
  return async function getServerSideProps(context) {
    const user = await getServerAuthUser(context);

    if (!user) {
      return { redirect: { destination: "/login", permanent: false } };
    }

    if (user.mustChangePassword) {
      return { redirect: { destination: "/profile", permanent: false } };
    }

    if (user.role !== PHARMACIST) {
      return { redirect: { destination: "/dashboard", permanent: false } };
    }

    if (next) {
      return next(context, user);
    }

    return { props: { user } };
  };
}
