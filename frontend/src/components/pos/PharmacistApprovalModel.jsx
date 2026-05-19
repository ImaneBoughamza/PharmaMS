.overlay {
  position: fixed;
  inset: 0;
  background: rgba(11, 28, 53, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ── */
.header {
  text-align: center;
}

.title {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 0.3rem;
}

.subtitle {
  font-family: var(--font-ui);
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Items list ── */
.itemsList {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
}

.itemRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.itemName {
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.itemQty {
  font-family: var(--font-ui);
  font-size: 0.78rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 1px 8px;
}

.divider {
  height: 1px;
  background: var(--color-border);
}

/* ── Status area ── */
.statusArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
  padding: 0.5rem 0;
  min-height: 100px;
  justify-content: center;
}

.waitingRow {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

/* Amber pulsing dot */
.pulseDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #D97706;
  flex-shrink: 0;
  animation: amberpulse 1.4s ease-in-out infinite;
}

@keyframes amberpulse {
  0%, 100% { opacity: 1;   transform: scale(1);   }
  50%       { opacity: 0.4; transform: scale(1.35); }
}

.statusText {
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.countdown {
  font-family: var(--font-ui);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.timerBar {
  width: 100%;
  height: 5px;
  background: var(--color-border);
  border-radius: 999px;
  overflow: hidden;
}

.timerFill {
  height: 100%;
  background: #D97706;
  border-radius: 999px;
  transition: width 1s linear;
}

.iconSuccess { color: var(--color-success); }
.iconError   { color: var(--color-error);   }

.statusTextSuccess {
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-success);
  margin: 0;
}

.statusTextError {
  font-family: var(--font-ui);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-error);
  margin: 0;
}

.autoNote {
  font-family: var(--font-ui);
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0;
}

.rejectionReason {
  font-family: var(--font-ui);
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
}

/* ── Footer ── */
.footer {
  display: flex;
  justify-content: center;
}

.cancelBtn {
  padding: 0.55rem 2rem;
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.cancelBtn:hover:not(:disabled) {
  border-color: var(--color-error);
  color: var(--color-error);
}

.cancelBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.backBtn {
  padding: 0.55rem 2rem;
  background: none;
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-md);
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.backBtn:hover {
  background: var(--color-accent);
  color: #ffffff;
}
