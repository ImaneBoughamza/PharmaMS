import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./CartItem.module.css";

export default function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.name}>{item.medicine.name}</span>
        <span className={styles.price}>{formatCurrency(item.medicine.salePrice)} / unit</span>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.qtyBtn}
          onClick={() => onQtyChange(item.medicine._id, item.qty - 1)}
          disabled={item.qty <= 1}
        >
          −
        </button>
        <span className={styles.qty}>{item.qty}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => onQtyChange(item.medicine._id, item.qty + 1)}
          disabled={item.qty >= item.medicine.totalStock}
        >
          +
        </button>
      </div>

      <span className={styles.subtotal}>
        {formatCurrency(item.medicine.salePrice * item.qty)}
      </span>

      <button className={styles.removeBtn} onClick={() => onRemove(item.medicine._id)}>
        <Trash2 size={15} />
      </button>
    </div>
  );
}
