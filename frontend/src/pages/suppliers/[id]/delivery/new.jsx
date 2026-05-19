import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";

export default function LegacySupplierDeliveryRoute() {
  return null;
}

export const getServerSideProps = pharmacistOnlyProps(async (context) => {
  const { id } = context.params;
  return {
    redirect: {
      destination: `/suppliers/delivery/new?supplierId=${id}`,
      permanent: false,
    },
  };
});
