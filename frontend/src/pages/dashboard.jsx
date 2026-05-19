import AppLayout from "@/components/layout/AppLayout";
import AssistantDashboard from "@/components/dashboard/AssistantDashboard";
import CashierDashboard from "@/components/dashboard/CashierDashboard";
import PharmacistDashboard from "@/components/dashboard/PharmacistDashboard";
import { ASSISTANT, CASHIER, PHARMACIST } from "@/constants/roles";
import { getServerAuthUser } from "@/utils/serverAuth";

export default function Dashboard({ user }) {
  if (user.role === PHARMACIST) return <PharmacistDashboard user={user} />;
  if (user.role === ASSISTANT) return <AssistantDashboard user={user} />;
  if (user.role === CASHIER) return <CashierDashboard user={user} />;
  return null;
}

Dashboard.getLayout = AppLayout.getLayout;

export async function getServerSideProps(context) {
  const user = await getServerAuthUser(context);
  if (!user) return { redirect: { destination: "/login", permanent: false } };
  if (user.mustChangePassword) {
    return { redirect: { destination: "/profile", permanent: false } };
  }
  if (![PHARMACIST, ASSISTANT, CASHIER].includes(user.role)) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  return { props: { user } };
}
