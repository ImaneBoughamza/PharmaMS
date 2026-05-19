.wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-ui);
  font-size: 0.875rem;
}

.thead {
  background: #f8fafc;
}

.th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.tr {
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}

.tr:last-child {
  border-bottom: none;
}

.tr:nth-child(even) {
  background: #fafafa;
}

.tr:hover {
  background: #f0f4ff;
}

.td {
  padding: 0.75rem 1rem;
  color: var(--color-text);
  vertical-align: middle;
}

.empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-style: italic;
}
