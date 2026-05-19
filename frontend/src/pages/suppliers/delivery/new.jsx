import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/lib/axios";
import { pharmacistOnlyProps } from "@/utils/pharmacistPageGuard";
import { formatDate } from "@/utils/formatDate";
import styles from "@/styles/SupplierManagement.module.css";

const today = new Date().toISOString().slice(0, 10);

const emptyMedicine = {
  medicineId: "",
  batchNumber: "",
  expiryDate: "",
  receivedQty: "",
  purchasePrice: "",
  salePrice: "",
};

const emptyParapharmacy = {
  productId: "",
  receivedQty: "",
  purchasePrice: "",
};

function typeClass(type) {
  return styles[`type_${type.replace(/\s+/g, "")}`] ?? styles.type_Other;
}

function TypeBadge({ type }) {
  return <span className={`${styles.typeBadge} ${typeClass(type)}`}>{type}</span>;
}

export default function NewDeliveryPage() {
  const router = useRouter();
  const supplierIdParam = router.query.supplierId;
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [parapharmacy, setParapharmacy] = useState([]);
  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lockedSupplier, setLockedSupplier] = useState(null);
  const [supplierId, setSupplierId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [orderId, setOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [medicineItems, setMedicineItems] = useState([]);
  const [paraItems, setParaItems] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function loadReferenceData() {
      try {
        const [supplierResponse, medicineResponse, parapharmacyResponse, batchResponse] = await Promise.all([
          api.get("/api/suppliers", { params: { status: "active", limit: 500 } }),
          api.get("/api/medicines", { params: { status: "active", limit: 500 } }),
          api.get("/api/parapharmacy", { params: { status: "active", limit: 500 } }),
          api.get("/api/batches", { params: { status: "all", limit: 1000 } }),
        ]);

        if (cancelled) return;

        const supplierList = supplierResponse.data.data ?? [];
        setSuppliers(supplierList);
        setMedicines(medicineResponse.data.data ?? []);
        setParapharmacy(parapharmacyResponse.data.data ?? []);
        setBatches(batchResponse.data.data ?? []);

        if (typeof supplierIdParam === "string") {
          const found = supplierList.find((supplier) => supplier._id === supplierIdParam);
          setLockedSupplier(found ?? null);
          setSupplierId(supplierIdParam);
        }
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.message ?? "Failed to load delivery reference data.");
      }
    }

    if (router.isReady) loadReferenceData();
    return () => { cancelled = true; };
  }, [router.isReady, supplierIdParam]);

  useEffect(() => {
    if (lockedSupplier) setSupplierId(lockedSupplier._id);
  }, [lockedSupplier]);

  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier._id === supplierId) ?? lockedSupplier,
    [suppliers, supplierId, lockedSupplier]
  );
  const activeSuppliers = suppliers.filter((supplier) => supplier.isActive !== false);
  const supplierMedicines = medicines.filter((medicine) => {
    const medSupplierId = medicine.supplierId?._id ?? medicine.supplierId;
    return medicine.isActive !== false && (!supplierId || String(medSupplierId) === String(supplierId));
  });
  const activeParapharmacy = parapharmacy.filter((product) => product.isActive !== false);

  function backPath() {
    if (lockedSupplier) return `/suppliers/${lockedSupplier._id}`;
    return "/suppliers";
  }

  function handleOrderChange(value) {
    setOrderId(value);
    const order = orders.find((item) => item._id === value);
    if (!order) return;
    setMedicineItems(order.medicineItems.map((item) => ({
      medicineId: item.medicineId,
      batchNumber: "",
      expiryDate: "",
      receivedQty: String(item.receivedQty),
      purchasePrice: String(item.purchasePrice),
      salePrice: String(item.salePrice),
    })));
    setParaItems(order.parapharmacyItems.map((item) => ({
      productId: item.productId,
      receivedQty: String(item.receivedQty),
      purchasePrice: String(item.purchasePrice),
    })));
  }

  function updateMedicine(index, field, value) {
    setMedicineItems((current) => current.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )));
  }

  function updatePara(index, field, value) {
    setParaItems((current) => current.map((item, i) => (
      i === index ? { ...item, [field]: value } : item
    )));
  }

  function validate() {
    const next = {};
    if (!supplierId) next.supplierId = "Supplier is required";
    if (!deliveryDate) next.deliveryDate = "Delivery date is required";
    if (deliveryDate > today) next.deliveryDate = "Delivery date cannot be in the future";
    if (medicineItems.length === 0 && paraItems.length === 0) {
      next.items = "Add at least one medicine or parapharmacy item to record this delivery";
    }

    medicineItems.forEach((item, index) => {
      if (!item.medicineId) next[`med-${index}-medicineId`] = "Medicine is required";
      if (!item.batchNumber.trim()) next[`med-${index}-batchNumber`] = "Batch number is required";
      if (!item.expiryDate) next[`med-${index}-expiryDate`] = "Expiry date is required";
      if (item.expiryDate && item.expiryDate <= today) next[`med-${index}-expiryDate`] = "Expiry date must be in the future";
      if (!Number.isInteger(Number(item.receivedQty)) || Number(item.receivedQty) < 1) next[`med-${index}-receivedQty`] = "Quantity must be at least 1";
      if (item.purchasePrice === "" || Number(item.purchasePrice) < 0) next[`med-${index}-purchasePrice`] = "Purchase price must be 0 or more";
      if (item.salePrice === "" || Number(item.salePrice) < 0) next[`med-${index}-salePrice`] = "Sale price must be 0 or more";
    });

    paraItems.forEach((item, index) => {
      if (!item.productId) next[`para-${index}-productId`] = "Product is required";
      if (!Number.isInteger(Number(item.receivedQty)) || Number(item.receivedQty) < 1) next[`para-${index}-receivedQty`] = "Quantity must be at least 1";
      if (item.purchasePrice === "" || Number(item.purchasePrice) < 0) next[`para-${index}-purchasePrice`] = "Purchase price must be 0 or more";
    });

    return next;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await api.post("/api/deliveries", {
        supplierId,
        deliveryDate: new Date(`${deliveryDate}T00:00:00.000Z`).toISOString(),
        orderId: orderId || undefined,
        notes,
        medicineItems: medicineItems.map((item) => ({
          medicineId: item.medicineId,
          batchNumber: item.batchNumber,
          expiryDate: new Date(`${item.expiryDate}T00:00:00.000Z`).toISOString(),
          receivedQty: Number(item.receivedQty),
          purchasePrice: Number(item.purchasePrice),
          salePrice: Number(item.salePrice),
        })),
        parapharmacyItems: paraItems.map((item) => ({
          productId: item.productId,
          receivedQty: Number(item.receivedQty),
          purchasePrice: Number(item.purchasePrice),
        })),
      });

      toast.success(`Delivery recorded - ${medicineItems.length} batches created, ${paraItems.length} parapharmacy quantities updated`);
      router.push(`/suppliers/${supplierId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to record delivery.");
    }
  }

  const linkedOrder = orders.find((order) => order._id === orderId);
  const totalItems = medicineItems.length + paraItems.length;
  const canSubmit = supplierId && totalItems > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <button type="button" className={styles.back} onClick={() => router.push(backPath())}>← Back</button>
          <h1 className={styles.title}>Record Delivery</h1>
        </div>
      </div>

      <form className={styles.deliveryLayout} onSubmit={handleSubmit} noValidate>
        <div className={styles.leftCol}>
          <section className={styles.formCard}>
            <div className={styles.formStack}>
              <section className={styles.formSection}>
                <h2>Delivery Information</h2>
                <Field label="Supplier" error={errors.supplierId}>
                  <select
                    value={supplierId}
                    disabled={Boolean(lockedSupplier)}
                    onChange={(e) => {
                      setSupplierId(e.target.value);
                      setOrderId("");
                    }}
                  >
                    <option value="">Select active supplier</option>
                    {activeSuppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name} - {supplier.type}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className={styles.formGrid}>
                  <Field label="Delivery Date" error={errors.deliveryDate}>
                    <input type="date" value={deliveryDate} max={today} onChange={(e) => setDeliveryDate(e.target.value)} />
                  </Field>
                  <Field label="Link to Purchase Order (optional)">
                    <select value={orderId} disabled={!supplierId} onChange={(e) => handleOrderChange(e.target.value)}>
                      <option value="">None</option>
                      {orders.map((order) => <option key={order._id} value={order._id}>{order.reference}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                </Field>
              </section>
            </div>
          </section>

          <ItemSection
            title="Medicine Deliveries"
            subtext="Add medicines received in this delivery"
            addLabel="Add Medicine Item"
            onAdd={() => setMedicineItems((current) => [...current, { ...emptyMedicine }])}
            emptyText="No medicine items added - click + Add Medicine Item to begin"
          >
            <div className={styles.lineList}>
              {medicineItems.map((item, index) => {
                const selectedMedicine = medicines.find((medicine) => medicine._id === item.medicineId);
                const duplicateWarning = item.batchNumber && batches.some((batch) => {
                  const medicineId = batch.medicineId?._id ?? batch.medicineId;
                  return String(medicineId) === String(item.medicineId) && batch.batchNumber === item.batchNumber;
                });
                return (
                  <div className={styles.lineCard} key={index}>
                    <div className={styles.lineHeader}>
                      <h3>Medicine Item #{index + 1}</h3>
                      <button type="button" className={styles.iconBtn} onClick={() => setMedicineItems((current) => current.filter((_, i) => i !== index))}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <Field label="Medicine" error={errors[`med-${index}-medicineId`]}>
                        <select value={item.medicineId} onChange={(e) => updateMedicine(index, "medicineId", e.target.value)}>
                          <option value="">Select medicine</option>
                          {supplierMedicines.map((medicine) => <option key={medicine._id} value={medicine._id}>{medicine.name}</option>)}
                        </select>
                      </Field>
                      <Field label="Batch Number" error={errors[`med-${index}-batchNumber`]}>
                        <input className={styles.mono} value={item.batchNumber} placeholder="e.g. BN-2026-001" onChange={(e) => updateMedicine(index, "batchNumber", e.target.value)} />
                      </Field>
                      <Field label="Expiry Date" error={errors[`med-${index}-expiryDate`]}>
                        <input type="date" value={item.expiryDate} min={today} onChange={(e) => updateMedicine(index, "expiryDate", e.target.value)} />
                      </Field>
                      <Field label="Received Qty" error={errors[`med-${index}-receivedQty`]}>
                        <input type="number" min="1" value={item.receivedQty} onChange={(e) => updateMedicine(index, "receivedQty", e.target.value)} />
                      </Field>
                      <Field label="Purchase Price" error={errors[`med-${index}-purchasePrice`]}>
                        <input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => updateMedicine(index, "purchasePrice", e.target.value)} />
                      </Field>
                      <Field label="Sale Price" error={errors[`med-${index}-salePrice`]}>
                        <input type="number" min="0" step="0.01" value={item.salePrice} onChange={(e) => updateMedicine(index, "salePrice", e.target.value)} />
                      </Field>
                    </div>
                    {duplicateWarning && (
                      <p className={styles.warningText}>Batch {item.batchNumber} already exists for {selectedMedicine?.name ?? "this medicine"} - verify this is correct</p>
                    )}
                  </div>
                );
              })}
            </div>
          </ItemSection>

          <ItemSection
            title="Parapharmacy Deliveries"
            subtext="Add parapharmacy products received in this delivery"
            addLabel="Add Parapharmacy Item"
            onAdd={() => setParaItems((current) => [...current, { ...emptyParapharmacy }])}
            emptyText="No parapharmacy items added - click + Add Parapharmacy Item to begin"
          >
            <div className={styles.lineList}>
              {paraItems.map((item, index) => (
                <div className={styles.lineCard} key={index}>
                  <div className={styles.lineHeader}>
                    <h3>Parapharmacy Item #{index + 1}</h3>
                    <button type="button" className={styles.iconBtn} onClick={() => setParaItems((current) => current.filter((_, i) => i !== index))}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className={styles.formGrid}>
                    <Field label="Product" error={errors[`para-${index}-productId`]}>
                      <select value={item.productId} onChange={(e) => updatePara(index, "productId", e.target.value)}>
                        <option value="">Select product</option>
                        {activeParapharmacy.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Received Qty" error={errors[`para-${index}-receivedQty`]}>
                      <input type="number" min="1" value={item.receivedQty} onChange={(e) => updatePara(index, "receivedQty", e.target.value)} />
                    </Field>
                    <Field label="Purchase Price" error={errors[`para-${index}-purchasePrice`]}>
                      <input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={(e) => updatePara(index, "purchasePrice", e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </ItemSection>

          {errors.items && <p className={styles.errorText}>{errors.items}</p>}
          <div className={styles.formActions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => router.push(backPath())}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={!canSubmit}>Record Delivery</button>
          </div>
        </div>

        <aside className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Delivery Summary</h2>
          <div className={styles.infoList}>
            <SummaryLine label="Selected Supplier" value={selectedSupplier ? <>{selectedSupplier.name} <TypeBadge type={selectedSupplier.type} /></> : "None"} />
            <SummaryLine label="Delivery Date" value={formatDate(deliveryDate)} />
            <SummaryLine label="Linked Order" value={linkedOrder?.reference ?? "None"} />
            <SummaryLine label="Medicine Items" value={`${medicineItems.length} items`} />
            <SummaryLine label="Parapharmacy" value={`${paraItems.length} items`} />
            <SummaryLine label="Total Items" value={totalItems} />
          </div>
        </aside>
      </form>
    </div>
  );
}

NewDeliveryPage.getLayout = AppLayout.getLayout;
export const getServerSideProps = pharmacistOnlyProps();

function Field({ label, error, children }) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      {children}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

function ItemSection({ title, subtext, addLabel, onAdd, emptyText, children }) {
  const hasChildren = children?.props?.children?.length > 0;
  return (
    <section className={styles.formCard}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p>{subtext}</p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={onAdd}>
          <Plus size={15} />
          {addLabel}
        </button>
      </div>
      {hasChildren ? children : <p className={styles.muted}>{emptyText}</p>}
    </section>
  );
}

function SummaryLine({ label, value }) {
  return (
    <div className={styles.summaryLine}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
