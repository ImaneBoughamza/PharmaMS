import { useState } from "react";
import { useRouter } from "next/router";
import AppLayout from "@/components/layout/AppLayout";
import SupplierTable from "@/components/suppliers/SupplierTable";
import Button from "@/components/ui/Button";
import styles from "@/styles/SuppliersPage.module.css";

// TODO: restore when backend is ready
// import useSWR from "swr";
// import { fetcher } from "@/lib/axios";
// export const getServerSideProps = withRoleGuard(["pharmacist"]);

const MOCK_SUPPLIERS = [
  {
    _id: "s1",
    name: "MedPharma Distribution",
    contactPerson: "Hassan Ouali",
    email: "contact@medpharma.ma",
    phone: "+212 522334455",
    address: "Casablanca, Maarif",
    medicineCount: 14,
  },
  {
    _id: "s2",
    name: "BioLab Morocco",
    contactPerson: "Samira Tazi",
    email: "samira@biolab.ma",
    phone: "+212 537112233",
    address: "Rabat, Agdal",
    medicineCount: 8,
  },
  {
    _id: "s3",
    name: "PharmaCo Supplies",
    contactPerson: "Mehdi Alami",
    email: "mehdi@pharmaco.ma",
    phone: "+212 528667788",
    address: "Agadir, Talborjt",
    medicineCount: 21,
  },
  {
    _id: "s4",
    name: "SantéPlus Maroc",
    contactPerson: null,
    email: "info@santeplus.ma",
    phone: "+212 524990011",
    address: "Marrakech, Guéliz",
    medicineCount: 5,
  },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function SuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // TODO: replace with real SWR fetch
  const suppliers = MOCK_SUPPLIERS;

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>Suppliers</h1>
        <Button variant="primary" onClick={() => router.push("/suppliers/add")}>
          + Add Supplier
        </Button>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchWrap}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.card}>
        <SupplierTable suppliers={filtered} />
      </div>
    </div>
  );
}

SuppliersPage.getLayout = AppLayout.getLayout;
