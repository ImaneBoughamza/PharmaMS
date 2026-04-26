import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import styles from "@/components/products/OrderForm.module.css";

const schema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productType: z.enum(["medicine", "parapharmacy"], { errorMap: () => ({ message: "Select a type" }) }),
        productId: z.string().min(1, "Product is required"),
        orderedQty: z.coerce.number().int().positive("Must be > 0"),
      })
    )
    .min(1, "At least one item is required"),
});

// TODO: replace with real API data
const MOCK_SUPPLIERS = [
  { _id: "s1", name: "PharmaDist Maroc" },
  { _id: "s2", name: "BioLab Supplies" },
];
const MOCK_MEDICINES = [
  { _id: "m1", name: "Paracetamol 500mg" },
  { _id: "m2", name: "Amoxicillin 1g" },
  { _id: "m3", name: "Ibuprofen 400mg" },
  { _id: "m4", name: "Diazepam 5mg" },
];
const MOCK_PARAPHARMACY = [
  { _id: "p1", name: "Vitamin D3 1000 IU" },
  { _id: "p2", name: "Micellar Water 400ml" },
  { _id: "p3", name: "Digital Thermometer" },
  { _id: "p4", name: "Hand Sanitiser 500ml" },
  { _id: "p5", name: "Omega-3 Fish Oil" },
];

function ItemRow({ index, control, register, errors, remove, showRemove, setValue }) {
  const productType = useWatch({ control, name: `items.${index}.productType` });
  const products = productType === "parapharmacy" ? MOCK_PARAPHARMACY : MOCK_MEDICINES;

  function handleTypeChange(e) {
    setValue(`items.${index}.productType`, e.target.value);
    setValue(`items.${index}.productId`, "");
  }

  return (
    <div className={styles.itemRow}>
      <div className={styles.itemField}>
        <select
          className={styles.select}
          value={productType ?? ""}
          onChange={handleTypeChange}
        >
          <option value="">Type…</option>
          <option value="medicine">Medicine</option>
          <option value="parapharmacy">Parapharmacy</option>
        </select>
        {errors.items?.[index]?.productType && (
          <p className={styles.error}>{errors.items[index].productType.message}</p>
        )}
      </div>

      <div className={styles.itemField}>
        <select
          className={styles.select}
          disabled={!productType}
          {...register(`items.${index}.productId`)}
        >
          <option value="">Select product…</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        {errors.items?.[index]?.productId && (
          <p className={styles.error}>{errors.items[index].productId.message}</p>
        )}
      </div>

      <div className={styles.qtyField}>
        <input
          type="number"
          min="1"
          className={styles.input}
          placeholder="Qty"
          {...register(`items.${index}.orderedQty`)}
        />
        {errors.items?.[index]?.orderedQty && (
          <p className={styles.error}>{errors.items[index].orderedQty.message}</p>
        )}
      </div>

      {showRemove && (
        <button type="button" className={styles.removeBtn} onClick={() => remove(index)}>
          ✕
        </button>
      )}
    </div>
  );
}

export default function OrderForm({ onSubmit, isLoading }) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      supplierId: "",
      notes: "",
      items: [{ productType: "medicine", productId: "", orderedQty: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Supplier</label>
        <select className={styles.select} {...register("supplierId")}>
          <option value="">Select supplier…</option>
          {MOCK_SUPPLIERS.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        {errors.supplierId && <p className={styles.error}>{errors.supplierId.message}</p>}
      </div>

      <div className={styles.itemsSection}>
        <div className={styles.itemsHeader}>
          <p className={styles.sectionTitle}>Order Items</p>
          <button
            type="button"
            className={styles.addItemBtn}
            onClick={() => append({ productType: "medicine", productId: "", orderedQty: 1 })}
          >
            + Add Item
          </button>
        </div>

        <div className={styles.itemColHeaders}>
          <span>Type</span>
          <span>Product</span>
          <span>Qty</span>
        </div>

        {fields.map((field, index) => (
          <ItemRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            errors={errors}
            remove={remove}
            showRemove={fields.length > 1}
            setValue={setValue}
          />
        ))}
        {errors.items?.message && <p className={styles.error}>{errors.items.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes (optional)</label>
        <textarea className={styles.textarea} rows={3} {...register("notes")} />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={isLoading} isLoading={isLoading}>
          Submit Order
        </Button>
      </div>
    </form>
  );
}
