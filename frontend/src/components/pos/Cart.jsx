import { ShoppingCart } from "lucide-react";
import CartItem from "./CartItem";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./Cart.module.css";

export default function Cart({ items, onQtyChange, onRemove }) {
  const subtotal = items.reduce((sum, i) => sum + i.item.salePrice * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <ShoppingCart size={32} strokeWidth={1.5} />
        <p>Cart is empty</p>
        <span>Search for a product above to add it</span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.items}>
        {items.map((cartItem) => (
          <CartItem
            key={cartItem.item._id}
            item={cartItem}
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
