import { useRouter } from "next/router";

export default function InventoryDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Inventory Item Details</h1>
      <p>Medicine ID: {id}</p>
      <p>This page is under construction.</p>
    </div>
  );
}