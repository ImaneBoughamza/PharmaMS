import CartItem from "./CartItem";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./Cart.module.css";

export default function Cart({ items, onQtyChange, onRemove }) {
  const subtotal = items.reduce((sum, i) => sum + i.medicine.salePrice * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Cart is empty.</p>
        <span>Search for a medicine on the left to add it.</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.items}>
        {items.map((item) => (
          <CartItem
            key={item.medicine._id}
            item={item}
            onQtyChange={onQtyChange}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div className={styles.subtotalRow}>
        <span className={styles.subtotalLabel}>Subtotal</span>
        <span className={styles.subtotalValue}>{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}
