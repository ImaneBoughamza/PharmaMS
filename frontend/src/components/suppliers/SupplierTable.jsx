import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import styles from "./SupplierTable.module.css";

export default function SupplierTable({ suppliers }) {
  const router = useRouter();

  if (suppliers.length === 0) {
    return <p className={styles.empty}>No suppliers found.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Medicines</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s._id}>
              <td className={styles.name}>{s.name}</td>
              <td>{s.contactPerson ?? "—"}</td>
              <td className={styles.email}>{s.email ?? "—"}</td>
              <td>{s.phone ?? "—"}</td>
              <td className={styles.count}>{s.medicineCount ?? 0}</td>
              <td>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(`/suppliers/${s._id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
