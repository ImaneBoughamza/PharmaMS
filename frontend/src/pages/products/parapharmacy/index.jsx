import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import ParapharmacyTable from "@/components/products/ParapharmacyTable";
import { PHARMACIST } from "@/constants/roles";
import styles from "@/styles/ParapharmacyPage.module.css";

// TODO: replace with useSWR("/api/parapharmacy") when backend is ready
const MOCK_ROLE = PHARMACIST;
const MOCK_PRODUCTS = [
  { _id: "p1", name: "Vitamin D3 1000 IU", brand: "Sanofi",    category: "supplements",    stockQty: 48, minStockLevel: 10, salePrice: 85 },
  { _id: "p2", name: "Micellar Water 400ml",brand: "Bioderma",  category: "cosmetics",      stockQty: 12, minStockLevel: 5,  salePrice: 120 },
  { _id: "p3", name: "Digital Thermometer", brand: "Omron",     category: "medical-device", stockQty: 3,  minStockLevel: 5,  salePrice: 220 },
  { _id: "p4", name: "Hand Sanitiser 500ml",brand: "Dettol",    category: "hygiene",        stockQty: 0,  minStockLevel: 10, salePrice: 45 },
  { _id: "p5", name: "Omega-3 Fish Oil",    brand: "Nutrident", category: "supplements",    stockQty: 30, minStockLevel: 8,  salePrice: 150 },
];

export default function ParapharmacyIndexPage() {
  const [search, setSearch] = useState("");
  const role = MOCK_ROLE;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Parapharmacy</h1>
        <div className={styles.actions}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {role === PHARMACIST && (
            <Link href="/products/parapharmacy/add" className={styles.addBtn}>
              + Add Product
            </Link>
          )}
        </div>
      </div>

      <ParapharmacyTable products={filtered} />
    </div>
  );
}

ParapharmacyIndexPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
