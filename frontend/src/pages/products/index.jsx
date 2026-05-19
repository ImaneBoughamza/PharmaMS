import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, X, Edit2, Power } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import StockAlertBanner from "@/components/inventory/StockAlertBanner";
import { useAuth } from "@/hooks/useAuth";
import { PHARMACIST } from "@/constants/roles";
import api from "@/lib/axios";
import styles from "@/styles/InventoryPage.module.css";

const PAGE_SIZE = 20;

// ── Schemas ───────────────────────────────────────────────────────────────
const medEditSchema = z.object({
  name:          z.string().min(1, "Required"),
  genericName:   z.string().optional().default(""),
  category:      z.enum(["non-prescription", "prescription", "regulated"]),
  unit:          z.string().min(1, "Required"),
  minStockLevel: z.coerce.number().min(0, "Must be ≥ 0"),
  supplierId:    z.string().optional(),
});

const paraEditSchema = z.object({
  name:          z.string().min(1, "Required"),
  brand:         z.string().optional().default(""),
  category:      z.enum(["cosmetics", "supplements", "medical-device", "hygiene", "other"]),
  purchasePrice: z.coerce.number().positive("Must be positive"),
  salePrice:     z.coerce.number().positive("Must be positive"),
  minStockLevel: z.coerce.number().int().min(0, "Must be ≥ 0"),
  supplierId:    z.string().optional(),
});

// ── Status helpers ────────────────────────────────────────────────────────
function getMedStatus(m) {
  if (!m.isActive) return "inactive";
  if (m.totalStock === 0) return "out";
  if (m.totalStock < m.minStockLevel) return "low";
  if (m.nearestExpiry) {
    const days = (new Date(m.nearestExpiry) - Date.now()) / 86400000;
    if (days <= 90) return "nearExpiry";
  }
  return "ok";
}

function getParaStatus(p) {
  if (!p.isActive) return "inactive";
  if (p.stockQty === 0) return "out";
  if (p.stockQty < p.minStockLevel) return "low";
  return "ok";
}

const STATUS_META = {
  inactive:   { label: "Inactive",     variant: "expired"    },
  out:        { label: "Out of Stock", variant: "cancelled"  },
  low:        { label: "Low Stock",    variant: "pending"    },
  nearExpiry: { label: "Near Expiry",  variant: "pending"    },
  ok:         { label: "Active",       variant: "confirmed"  },
};

function rowClass(status, s) {
  const cls = [s.table];
  if (status === "low" || status === "out") cls.push(s.rowLowStock);
  if (status === "nearExpiry") cls.push(s.rowNearExpiry);
  if (status === "inactive") cls.push(s.rowDeactivated);
  return cls.join(" ");
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isNearExpiry(iso) {
  if (!iso) return false;
  return (new Date(iso) - Date.now()) / 86400000 <= 90;
}

function fmtMAD(v) {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(v ?? 0);
}

function normalizeSupplier(item) {
  const supplier = item.supplierId && typeof item.supplierId === "object" ? item.supplierId : item.supplier;
  return supplier ? { _id: supplier._id, name: supplier.name } : null;
}

function normalizeMedicine(item) {
  return {
    ...item,
    supplier: normalizeSupplier(item),
    totalStock: item.totalStock ?? item.stock?.totalStock ?? 0,
    batchCount: item.batchCount ?? item.stock?.activeBatches ?? 0,
    nearestExpiry: item.nearestExpiry ?? item.stock?.nearestExpiry ?? null,
  };
}

function normalizeParapharmacy(item) {
  return {
    ...item,
    supplier: normalizeSupplier(item),
    stockQty: item.stockQty ?? 0,
  };
}

// ── Edit forms (defined here so they can use their own useForm) ───────────
function MedEditForm({ defaultValues, formId, onSubmit, suppliers = [] }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(medEditSchema),
    defaultValues,
  });
  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.formGrid2}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Medicine Name *</label>
          <input className={styles.formInput} {...register("name")} />
          {errors.name && <p className={styles.formError}>{errors.name.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Generic Name</label>
          <input className={styles.formInput} {...register("genericName")} />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Category *</label>
          <select className={styles.formSelect} {...register("category")}>
            <option value="non-prescription">Non-Prescription</option>
            <option value="prescription">Prescription</option>
            <option value="regulated">Regulated</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Unit *</label>
          <input className={styles.formInput} {...register("unit")} placeholder="tablet, bottle…" />
          {errors.unit && <p className={styles.formError}>{errors.unit.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Min Stock Level *</label>
          <input type="number" className={styles.formInput} {...register("minStockLevel")} />
          {errors.minStockLevel && <p className={styles.formError}>{errors.minStockLevel.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Supplier</label>
          <select className={styles.formSelect} {...register("supplierId")}>
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );
}

function ParaEditForm({ defaultValues, formId, onSubmit, suppliers = [] }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(paraEditSchema),
    defaultValues,
  });
  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.formGrid2}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Product Name *</label>
          <input className={styles.formInput} {...register("name")} />
          {errors.name && <p className={styles.formError}>{errors.name.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Brand</label>
          <input className={styles.formInput} {...register("brand")} />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Category *</label>
          <select className={styles.formSelect} {...register("category")}>
            <option value="cosmetics">Cosmetics</option>
            <option value="supplements">Supplements</option>
            <option value="medical-device">Medical Device</option>
            <option value="hygiene">Hygiene</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Supplier</label>
          <select className={styles.formSelect} {...register("supplierId")}>
            <option value="">No supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Purchase Price (MAD) *</label>
          <input type="number" step="0.01" className={styles.formInput} {...register("purchasePrice")} />
          {errors.purchasePrice && <p className={styles.formError}>{errors.purchasePrice.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Sale Price (MAD) *</label>
          <input type="number" step="0.01" className={styles.formInput} {...register("salePrice")} />
          {errors.salePrice && <p className={styles.formError}>{errors.salePrice.message}</p>}
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Min Stock Level *</label>
          <input type="number" className={styles.formInput} {...register("minStockLevel")} />
          {errors.minStockLevel && <p className={styles.formError}>{errors.minStockLevel.message}</p>}
        </div>
      </div>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [tab, setTab] = useState("medicines");

  const [medicines, setMedicines]       = useState([]);
  const [parapharmacy, setParapharmacy] = useState([]);
  const [suppliers, setSuppliers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState("");

  useEffect(() => {
    const nextTab = router.query.tab;
    if (nextTab === "medicines" || nextTab === "parapharmacy") {
      setTab(nextTab);
    }
  }, [router.query.tab]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setLoadError("");
      try {
        const [medicineResponse, parapharmacyResponse, supplierResponse] = await Promise.all([
          api.get("/api/medicines", { params: { status: "all", limit: 500 } }),
          api.get("/api/parapharmacy", { params: { status: "all", limit: 500 } }),
          api.get("/api/suppliers", { params: { status: "all", limit: 500 } }).catch(() => ({ data: { data: [] } })),
        ]);

        if (cancelled) return;

        setMedicines((medicineResponse.data.data ?? []).map(normalizeMedicine));
        setParapharmacy((parapharmacyResponse.data.data ?? []).map(normalizeParapharmacy));
        setSuppliers(supplierResponse.data.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.response?.data?.message ?? "Failed to load products.");
          setMedicines([]);
          setParapharmacy([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => { cancelled = true; };
  }, []);

  // Debounced search
  const [searchRaw, setSearchRaw] = useState("");
  const [search, setSearch]       = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchRaw); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchRaw]);

  // Filters
  const [catFilter,      setCatFilter]      = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [sort,           setSort]           = useState("name-asc");

  // Pagination
  const [page, setPage] = useState(1);

  // Modals
  const [editModal,       setEditModal]       = useState({ open: false, item: null });
  const [deactivateModal, setDeactivateModal] = useState({ open: false, item: null });

  const handleTabChange = (t) => {
    setTab(t);
    setSearchRaw("");
    setSearch("");
    setCatFilter("");
    setStatusFilter("");
    setSupplierFilter("");
    setSort("name-asc");
    setPage(1);
  };

  const clearFilters = () => {
    setSearchRaw("");
    setSearch("");
    setCatFilter("");
    setStatusFilter("");
    setSupplierFilter("");
    setSort("name-asc");
    setPage(1);
  };

  const hasFilters = search || catFilter || statusFilter || supplierFilter || sort !== "name-asc";

  // ── Filtered + sorted lists ────────────────────────────────────────────
  const filteredMeds = useMemo(() => {
    let list = medicines.map((m) => ({ ...m, _status: getMedStatus(m) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.name.toLowerCase().includes(q) || (m.genericName ?? "").toLowerCase().includes(q)
      );
    }
    if (catFilter)      list = list.filter((m) => m.category === catFilter);
    if (statusFilter)   list = list.filter((m) => m._status === statusFilter);
    if (supplierFilter) list = list.filter((m) => m.supplier?._id === supplierFilter);
    list.sort((a, b) => {
      if (sort === "name-asc")   return a.name.localeCompare(b.name);
      if (sort === "name-desc")  return b.name.localeCompare(a.name);
      if (sort === "stock-asc")  return a.totalStock - b.totalStock;
      if (sort === "stock-desc") return b.totalStock - a.totalStock;
      return 0;
    });
    return list;
  }, [medicines, search, catFilter, statusFilter, supplierFilter, sort]);

  const filteredPara = useMemo(() => {
    let list = parapharmacy.map((p) => ({ ...p, _status: getParaStatus(p) }));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || (p.brand ?? "").toLowerCase().includes(q)
      );
    }
    if (catFilter)      list = list.filter((p) => p.category === catFilter);
    if (statusFilter)   list = list.filter((p) => p._status === statusFilter);
    if (supplierFilter) list = list.filter((p) => p.supplier?._id === supplierFilter);
    list.sort((a, b) => {
      if (sort === "name-asc")   return a.name.localeCompare(b.name);
      if (sort === "name-desc")  return b.name.localeCompare(a.name);
      if (sort === "stock-asc")  return a.stockQty - b.stockQty;
      if (sort === "stock-desc") return b.stockQty - a.stockQty;
      return 0;
    });
    return list;
  }, [parapharmacy, search, catFilter, statusFilter, supplierFilter, sort]);

  const current = tab === "medicines" ? filteredMeds : filteredPara;
  const pageCount = Math.max(1, Math.ceil(current.length / PAGE_SIZE));
  const paged     = current.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lowStockCount = medicines.filter(
    (m) => m.isActive && (m.totalStock === 0 || m.totalStock < m.minStockLevel)
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────────
  async function handleSaveMed(data) {
    try {
      const { data: response } = await api.patch(`/api/medicines/${editModal.item._id}`, data);
      const updated = normalizeMedicine({
        ...response.data,
        supplier: suppliers.find((supplier) => supplier._id === response.data.supplierId) ?? editModal.item.supplier,
      });
      setMedicines((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      toast.success("Medicine updated");
      setEditModal({ open: false, item: null });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update medicine.");
    }
  }

  async function handleSavePara(data) {
    try {
      const { data: response } = await api.patch(`/api/parapharmacy/${editModal.item._id}`, data);
      const updated = normalizeParapharmacy({
        ...response.data,
        supplier: suppliers.find((supplier) => supplier._id === response.data.supplierId) ?? editModal.item.supplier,
      });
      setParapharmacy((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      toast.success("Product updated");
      setEditModal({ open: false, item: null });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update product.");
    }
  }

  async function handleToggleActive() {
    const { item } = deactivateModal;
    const next = !item.isActive;
    try {
      const resource = tab === "medicines" ? "medicines" : "parapharmacy";
      const action = next ? "reactivate" : "deactivate";
      await api.patch(`/api/${resource}/${item._id}/${action}`);
      if (tab === "medicines") {
        setMedicines((prev) => prev.map((m) => m._id === item._id ? { ...m, isActive: next } : m));
      } else {
        setParapharmacy((prev) => prev.map((p) => p._id === item._id ? { ...p, isActive: next } : p));
      }
      toast.success(next ? `${item.name} reactivated` : `${item.name} deactivated`);
      setDeactivateModal({ open: false, item: null });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to update product status.");
    }
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Products</h1>
        <div className={styles.actions}>
          {role === PHARMACIST && (
            <Link href="/products/orders" className={styles.secondaryBtn}>Orders</Link>
          )}
          {tab === "medicines" && role === PHARMACIST && (
            <Link href="/products/add" className={styles.addBtn}>+ Add Medicine</Link>
          )}
          {tab === "parapharmacy" && role === PHARMACIST && (
            <Link href="/products/parapharmacy/add" className={styles.addBtn}>+ Add Product</Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button className={tab === "medicines"    ? styles.tabActive : styles.tab} onClick={() => handleTabChange("medicines")}>Medicines</button>
        <button className={tab === "parapharmacy" ? styles.tabActive : styles.tab} onClick={() => handleTabChange("parapharmacy")}>Parapharmacy</button>
      </div>

      {/* Toolbar: search */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={tab === "medicines" ? "Search medicines…" : "Search products…"}
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            style={{ paddingRight: searchRaw ? 28 : undefined }}
          />
          {searchRaw && (
            <button className={styles.searchClear} onClick={() => { setSearchRaw(""); setSearch(""); setPage(1); }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersBar}>
        {tab === "medicines" ? (
          <select className={styles.filterSelect} value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            <option value="non-prescription">Non-Prescription</option>
            <option value="prescription">Prescription</option>
            <option value="regulated">Regulated</option>
          </select>
        ) : (
          <select className={styles.filterSelect} value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            <option value="cosmetics">Cosmetics</option>
            <option value="supplements">Supplements</option>
            <option value="medical-device">Medical Device</option>
            <option value="hygiene">Hygiene</option>
            <option value="other">Other</option>
          </select>
        )}
        <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="ok">Active</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          {tab === "medicines" && <option value="nearExpiry">Near Expiry</option>}
          <option value="inactive">Inactive</option>
        </select>
        <select className={styles.filterSelect} value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setPage(1); }}>
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={sort} onChange={(e) => setSort(e.target.value)} style={{ minWidth: 140 }}>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
          <option value="stock-desc">Stock ↓</option>
          <option value="stock-asc">Stock ↑</option>
        </select>
        {hasFilters && (
          <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {/* Low-stock banner (medicines only) */}
      {tab === "medicines" && <StockAlertBanner count={lowStockCount} />}

      {loading && <p className={styles.emptyCell}>Loading products...</p>}
      {loadError && <p className={styles.emptyCell}>{loadError}</p>}

      {/* Table */}
      {!loading && !loadError && <div className={styles.tableWrap}>
        {tab === "medicines" ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Medicine / Generic</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Batches</th>
                <th>Nearest Expiry</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyCell}>No medicines match your filters.</td></tr>
              ) : paged.map((m) => {
                const { label, variant } = STATUS_META[m._status];
                return (
                  <tr key={m._id} className={[
                    (m._status === "low" || m._status === "out") ? styles.rowLowStock : "",
                    m._status === "nearExpiry" ? styles.rowNearExpiry : "",
                    m._status === "inactive"   ? styles.rowDeactivated : "",
                  ].filter(Boolean).join(" ")}>
                    <td>
                      <span className={styles.cellName}>{m.name}</span>
                      {m.genericName && <span className={styles.cellSub}>{m.genericName}</span>}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{m.category}</td>
                    <td className={styles.mono}>{m.totalStock} {m.unit}s</td>
                    <td className={styles.mono}>{m.batchCount}</td>
                    <td className={isNearExpiry(m.nearestExpiry) ? styles.nearExpTxt : styles.mono}>{fmtDate(m.nearestExpiry)}</td>
                    <td>{m.supplier?.name || "—"}</td>
                    <td><Badge variant={variant}>{label}</Badge></td>
                    <td>
                      <div className={styles.actionGroup}>
                        <Link href={`/products/${m._id}`} className={styles.actionBtn}>View</Link>
                        {role === PHARMACIST && (
                          <>
                            <button
                              className={styles.actionBtn}
                              onClick={() => setEditModal({ open: true, item: m })}
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              className={m.isActive ? styles.deactivateBtn : styles.activateBtn}
                              onClick={() => setDeactivateModal({ open: true, item: m })}
                            >
                              <Power size={11} /> {m.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product / Brand</th>
                <th>Category</th>
                <th>Stock Qty</th>
                <th>Min Stock</th>
                <th>Sale Price</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={8} className={styles.emptyCell}>No products match your filters.</td></tr>
              ) : paged.map((p) => {
                const { label, variant } = STATUS_META[p._status];
                return (
                  <tr key={p._id} className={[
                    (p._status === "low" || p._status === "out") ? styles.rowLowStock : "",
                    p._status === "inactive" ? styles.rowDeactivated : "",
                  ].filter(Boolean).join(" ")}>
                    <td>
                      <span className={styles.cellName}>{p.name}</span>
                      {p.brand && <span className={styles.cellSub}>{p.brand}</span>}
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                    <td className={styles.mono}>{p.stockQty}</td>
                    <td className={styles.mono}>{p.minStockLevel}</td>
                    <td className={styles.mono}>{fmtMAD(p.salePrice)}</td>
                    <td>{p.supplier?.name || "—"}</td>
                    <td><Badge variant={variant}>{label}</Badge></td>
                    <td>
                      <div className={styles.actionGroup}>
                        <Link href={`/products/parapharmacy/${p._id}`} className={styles.actionBtn}>View</Link>
                        {role === PHARMACIST && (
                          <>
                            <button
                              className={styles.actionBtn}
                              onClick={() => setEditModal({ open: true, item: p })}
                            >
                              <Edit2 size={11} /> Edit
                            </button>
                            <button
                              className={p.isActive ? styles.deactivateBtn : styles.activateBtn}
                              onClick={() => setDeactivateModal({ open: true, item: p })}
                            >
                              <Power size={11} /> {p.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {current.length > PAGE_SIZE && (
          <div className={styles.paginationBar}>
            <span className={styles.paginationInfo}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, current.length)} of {current.length}
            </span>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === page ? styles.pageBtnActive : styles.pageBtn}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className={styles.pageBtn} disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>}

      {/* Edit Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, item: null })}
        title={tab === "medicines" ? "Edit Medicine" : "Edit Product"}
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => setEditModal({ open: false, item: null })}>Cancel</button>
            <button className={styles.successBtn} type="submit" form="edit-form">Save Changes</button>
          </>
        }
      >
        {editModal.item && tab === "medicines" && (
          <MedEditForm
            key={editModal.item._id}
            formId="edit-form"
            defaultValues={{
              name:          editModal.item.name,
              genericName:   editModal.item.genericName ?? "",
              category:      editModal.item.category,
              unit:          editModal.item.unit,
              minStockLevel: editModal.item.minStockLevel,
              supplierId:    editModal.item.supplier?._id ?? "",
            }}
            onSubmit={handleSaveMed}
            suppliers={suppliers}
          />
        )}
        {editModal.item && tab === "parapharmacy" && (
          <ParaEditForm
            key={editModal.item._id}
            formId="edit-form"
            defaultValues={{
              name:          editModal.item.name,
              brand:         editModal.item.brand ?? "",
              category:      editModal.item.category,
              purchasePrice: editModal.item.purchasePrice,
              salePrice:     editModal.item.salePrice,
              minStockLevel: editModal.item.minStockLevel,
              supplierId:    editModal.item.supplier?._id ?? "",
            }}
            onSubmit={handleSavePara}
            suppliers={suppliers}
          />
        )}
      </Modal>

      {/* Deactivate / Activate Modal */}
      <Modal
        isOpen={deactivateModal.open}
        onClose={() => setDeactivateModal({ open: false, item: null })}
        title={deactivateModal.item?.isActive ? "Deactivate Product" : "Reactivate Product"}
        size="sm"
        footer={
          <>
            <button className={styles.ghostBtn} onClick={() => setDeactivateModal({ open: false, item: null })}>Cancel</button>
            {deactivateModal.item?.isActive ? (
              <button className={styles.dangerBtn} onClick={handleToggleActive}>Deactivate</button>
            ) : (
              <button className={styles.successBtn} onClick={handleToggleActive}>Reactivate</button>
            )}
          </>
        }
      >
        {deactivateModal.item && (
          <p className={styles.confirmText}>
            {deactivateModal.item.isActive
              ? <>Are you sure you want to deactivate <span className={styles.confirmName}>{deactivateModal.item.name}</span>? It will no longer appear in POS or sales flows.</>
              : <>Reactivate <span className={styles.confirmName}>{deactivateModal.item.name}</span>? It will become available again for sales.</>
            }
          </p>
        )}
      </Modal>
    </div>
  );
}

ProductsPage.getLayout = AppLayout.getLayout;

// TODO: restore when backend is ready
// export const getServerSideProps = withRoleGuard([PHARMACIST, ASSISTANT]);
