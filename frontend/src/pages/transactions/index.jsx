// TODO [PROVISIONAL-2]: scope to be confirmed with supervisor
import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import TransactionTable from "@/components/transactions/TransactionTable";
import styles from "@/styles/TransactionsPage.module.css";

const MOCK_TRANSACTIONS = [
  { _id: "t1", _type: "sale",        totalAmount: 245.5,  invoice: { receiptNumber: "REC-2026-100123" }, createdAt: "2026-04-19T10:15:00Z" },
  { _id: "t2", _type: "reservation", customerName: "Sara Alami",  confirmationCode: "RES-2026-441234", status: "confirmed",  createdAt: "2026-04-19T09:00:00Z" },
  { _id: "t3", _type: "delivery",    supplierId: { name: "PharmaDist Maroc" }, createdAt: "2026-04-18T14:30:00Z" },
  { _id: "t4", _type: "sale",        totalAmount: 87.0,   invoice: { receiptNumber: "REC-2026-100124" }, createdAt: "2026-04-18T11:45:00Z" },
  { _id: "t5", _type: "reservation", customerName: "Ahmed Bensaid", confirmationCode: "RES-2026-441235", status: "pending",  createdAt: "2026-04-17T16:00:00Z" },
  { _id: "t6", _type: "sale",        totalAmount: 560.0,  invoice: { receiptNumber: "REC-2026-100125" }, createdAt: "2026-04-17T09:30:00Z" },
  { _id: "t7", _type: "delivery",    supplierId: { name: "BioLab Supplies"   }, createdAt: "2026-04-16T08:00:00Z" },
];

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      if (typeFilter && tx._type !== typeFilter) return false;
      if (fromDate && new Date(tx.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(tx.createdAt) > new Date(toDate + "T23:59:59Z")) return false;
      return true;
    });
  }, [typeFilter, fromDate, toDate]);

  const salesTotal = filtered
    .filter((t) => t._type === "sale")
    .reduce((s, t) => s + (t.totalAmount ?? 0), 0);

  const salesCount  = filtered.filter((t) => t._type === "sale").length;
  const resCount    = filtered.filter((t) => t._type === "reservation").length;
  const delCount    = filtered.filter((t) => t._type === "delivery").length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.note}>TODO [PROVISIONAL-2] — scope to be confirmed with supervisor</p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Type</label>
          <select className={styles.filterSelect} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All types</option>
            <option value="sale">Sales</option>
            <option value="reservation">Reservations</option>
            <option value="delivery">Deliveries</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>From</label>
          <input type="date" className={styles.filterInput} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>To</label>
          <input type="date" className={styles.filterInput} value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Sales Revenue</p>
          <p className={styles.summaryValue}>
            {new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(salesTotal)}
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Sales / Reservations</p>
          <p className={styles.summaryValue}>{salesCount} / {resCount}</p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>Deliveries</p>
          <p className={styles.summaryValue}>{delCount}</p>
        </div>
      </div>

      <TransactionTable transactions={filtered} />
    </div>
  );
}

TransactionsPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST]);
