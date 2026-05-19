.panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Cart Totals ── */
.totalsSection {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.divider {
  height: 1px;
  background: var(--color-border);
}

.subtotalRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtotalLabel {
  font-family: var(--font-ui);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.subtotalValue {
  font-family: var(--font-ui);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
}

.grandTotalRow {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.25rem 0 0.1rem;
}

.grandTotalLabel {
  font-family: var(--font-ui);
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.grandTotalValue {
  font-family: var(--font-heading);
  font-size: 1.625rem; /* 26px */
  font-weight: 700;
  color: var(--color-primary);
  text-align: right;
}

/* ── Payment Method ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-family: var(--font-ui);
  font-size: 0.6875rem; /* 11px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.methods {
  display: flex;
  gap: 0.5rem;
}

.methodBtn {
  flex: 1;
  padding: 0.6rem 0.5rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.methodBtn:hover:not(:disabled):not(.active) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.methodBtn.active {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
}

.methodBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Complete Sale Button ── */
.checkoutBtn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 0.9375rem; /* 15px */
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.checkoutBtn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 85%, #000);
}

.checkoutBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── Pharmacist regulated notice ── */
.regulatedNotice {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, #D97706 10%, transparent);
  border: 1px solid color-mix(in srgb, #D97706 30%, transparent);
  font-family: var(--font-ui);
  font-size: 0.78rem;
  font-weight: 500;
  color: #92400E;
}

/* ── Receipt mode ── */
.paymentCompleted {
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-bg);
}

.newSaleBtn {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.newSaleBtn:hover {
  background: color-mix(in srgb, var(--color-accent) 85%, #000);
}
