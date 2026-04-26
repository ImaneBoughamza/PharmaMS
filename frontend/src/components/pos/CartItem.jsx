import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./CartItem.module.css";

export default function CartItem({ item, onQtyChange, onRemove }) {
  const { item: product, qty } = item;
  const [inputVal, setInputVal] = useState(String(qty));

  // Keep input in sync when parent qty changes (e.g. search adds same item again)
  useEffect(() => {
    setInputVal(String(qty));
  }, [qty]);

  const numVal     = parseInt(inputVal) || 0;
  const isOverStock = numVal > product.stock;
  const isRegulated = product.type === "medicine" && product.category === "regulated";

  function handleInputChange(e) {
    const raw = e.target.value;
    setInputVal(raw);
    const n = parseInt(raw);
    if (!isNaN(n) && n >= 1 && n <= product.stock) {
      onQtyChange(product._id, n);
    }
  }

  function handleInputBlur() {
    const n = parseInt(inputVal);
    if (isNaN(n) || n < 1) {
      setInputVal(String(qty));
    } else if (n > product.stock) {
      setInputVal(String(product.stock));
      onQtyChange(product._id, product.stock);
    }
  }

  const rowClass = [
    styles.row,
    isOverStock ? styles.rowOverStock : isRegulated ? styles.rowRegulated : "",
  ].join(" ").trim();

  return (
    <div className={rowClass}>
      {/* Top: name + tags + remove */}
      <div className={styles.top}>
        <div className={styles.nameAndTags}>
          <span className={styles.name}>{product.name}</span>
          <div className={styles.tags}>
            <span className={product.type === "medicine" ? styles.tagMedicine : styles.tagPara}>
              {product.type === "medicine" ? "Medicine" : "Parapharmacy"}
            </span>
            {isRegulated && <span className={styles.tagRegulated}>Regulated</span>}
          </div>
        </div>
        <button
          className={styles.removeBtn}
          onClick={() => onRemove(product._id)}
          type="button"
          aria-label="Remove item"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Bottom: qty controls + unit price + line total */}
      <div className={styles.bottom}>
        <div className={styles.qtyGroup}>
          <button
            className={styles.qtyBtn}
            onClick={() => onQtyChange(product._id, qty - 1)}
            disabled={qty <= 1}
            type="button"
          >
            −
          </button>
          <input
            className={[styles.qtyInput, isOverStock ? styles.qtyInputError : ""].join(" ")}
            type="number"
            min="1"
            max={product.stock}
            value={inputVal}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
          <button
            className={styles.qtyBtn}
            onClick={() => onQtyChange(product._id, qty + 1)}
            disabled={qty >= product.stock}
            type="button"
          >
            +
          </button>
        </div>
        <span className={styles.unitPrice}>{formatCurrency(product.salePrice)} / unit</span>
        <span className={styles.lineTotal}>{formatCurrency(product.salePrice * qty)}</span>
      </div>

      {isOverStock && (
        <p className={styles.overStockWarn}>Only {product.stock} available</p>
      )}
    </div>
  );
}
