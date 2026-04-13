import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import {
  createItem,
  deleteItem,
  fetchDepartments,
  fetchItems,
  fetchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  updateItem,
} from "../services/hospify";

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function DepartmentInventoryPage() {
  const { departmentId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [itemModal, setItemModal] = useState(null); // {mode:'add'|'edit', item?}
  const [vendorModal, setVendorModal] = useState(null); // {item, vendors, mode, vendor?}
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [depts, its] = await Promise.all([fetchDepartments(), fetchItems(departmentId)]);
        const found = depts.find((d) => d._id === departmentId) || null;
        if (!alive) return;
        setDept(found);
        setItems(its);
      } catch (err) {
        toast.push(err?.response?.data?.message || "Failed to load inventory", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [departmentId, toast]);

  const lowCount = useMemo(
    () => items.filter((i) => i.quantity < i.threshold).length,
    [items]
  );

  async function refreshItems() {
    const its = await fetchItems(departmentId);
    setItems(its);
  }

  return (
    <>
      <div className="topbar">
        <div className="pageTitle">
          <h1>{dept?.name || "Department"}</h1>
          <p>
            Manage items, thresholds, and vendors. Low stock:{" "}
            <span className={lowCount ? "pill pillWarn" : "pill pillOk"} style={{ marginLeft: 8 }}>
              {lowCount}
            </span>
          </p>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate("/departments")}>
            Back
          </button>
          <button className="btn btnPrimary" onClick={() => setItemModal({ mode: "add" })}>
            Add Item
          </button>
        </div>
      </div>

      <div className="grid">
        <section className="card">
          <div className="cardHeader">
            <strong>Inventory</strong>
            <span className="pill">{items.length} items</span>
          </div>
          <div className="cardBody">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const low = i.quantity < i.threshold;
                  return (
                    <tr key={i._id}>
                      <td style={{ fontWeight: 600 }}>{i.name}</td>
                      <td>{i.quantity}</td>
                      <td>{i.threshold}</td>
                      <td>
                        <span className={low ? "pill pillWarn" : "pill pillOk"}>
                          {low ? "Low" : "OK"}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        <button className="btn" onClick={() => setItemModal({ mode: "edit", item: i })}>
                          Edit
                        </button>{" "}
                        <button
                          className="btn"
                          onClick={async () => {
                            try {
                              setBusy(true);
                              const vendors = await fetchVendors(i._id);
                              setVendorModal({ item: i, vendors, mode: "list" });
                            } catch (err) {
                              toast.push(err?.response?.data?.message || "Failed to load vendors", "error");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                        >
                          Vendors
                        </button>{" "}
                        <button
                          className="btn btnPrimary"
                          onClick={() => navigate(`/orders/new?itemId=${encodeURIComponent(i._id)}&departmentId=${encodeURIComponent(departmentId)}`)}
                          disabled={!low}
                          title={!low ? "Order available when item is low" : "Place an order"}
                        >
                          Place Order
                        </button>{" "}
                        <button
                          className="btn btnDanger"
                          onClick={async () => {
                            if (!confirm(`Delete "${i.name}"? This cannot be undone.`)) return;
                            try {
                              setBusy(true);
                              await deleteItem(i._id);
                              toast.push("Item deleted.", "success");
                              await refreshItems();
                            } catch (err) {
                              toast.push(err?.response?.data?.message || "Delete failed", "error");
                            } finally {
                              setBusy(false);
                            }
                          }}
                          disabled={busy}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--muted)" }}>
                      No items in this department yet. Add your first item.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--muted)" }}>
                      Loading...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {itemModal ? (
        <ItemModal
          dept={dept}
          mode={itemModal.mode}
          item={itemModal.item}
          busy={busy}
          onClose={() => setItemModal(null)}
          onSave={async (payload) => {
            try {
              setBusy(true);
              if (itemModal.mode === "add") {
                await createItem({ ...payload, departmentId });
                toast.push("Item created.", "success");
              } else {
                await updateItem(itemModal.item._id, payload);
                toast.push("Item updated.", "success");
              }
              setItemModal(null);
              await refreshItems();
            } catch (err) {
              toast.push(err?.response?.data?.message || "Save failed", "error");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {vendorModal ? (
        <VendorModal
          data={vendorModal}
          busy={busy}
          onClose={() => setVendorModal(null)}
          onRefresh={async () => {
            const vendors = await fetchVendors(vendorModal.item._id);
            setVendorModal((v) => (v ? { ...v, vendors } : v));
          }}
          onCreate={async ({ name, contact }) => {
            try {
              setBusy(true);
              await createVendor({ name, contact, itemId: vendorModal.item._id });
              toast.push("Vendor added.", "success");
              const vendors = await fetchVendors(vendorModal.item._id);
              setVendorModal((v) => (v ? { ...v, vendors, mode: "list" } : v));
            } catch (err) {
              toast.push(err?.response?.data?.message || "Create vendor failed", "error");
            } finally {
              setBusy(false);
            }
          }}
          onUpdate={async (vendorId, payload) => {
            try {
              setBusy(true);
              await updateVendor(vendorId, payload);
              toast.push("Vendor updated.", "success");
              const vendors = await fetchVendors(vendorModal.item._id);
              setVendorModal((v) => (v ? { ...v, vendors, mode: "list" } : v));
            } catch (err) {
              toast.push(err?.response?.data?.message || "Update vendor failed", "error");
            } finally {
              setBusy(false);
            }
          }}
          onDelete={async (vendorId) => {
            try {
              setBusy(true);
              await deleteVendor(vendorId);
              toast.push("Vendor deleted.", "success");
              const vendors = await fetchVendors(vendorModal.item._id);
              setVendorModal((v) => (v ? { ...v, vendors } : v));
            } catch (err) {
              toast.push(err?.response?.data?.message || "Delete vendor failed", "error");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </>
  );
}

function ItemModal({ mode, item, onClose, onSave, busy }) {
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity ?? 0);
  const [threshold, setThreshold] = useState(item?.threshold ?? 0);

  return (
    <Modal
      title={mode === "add" ? "Add Item" : "Edit Item"}
      onClose={onClose}
      footer={
        <div className="toolbar" style={{ justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btnPrimary"
            onClick={() => onSave({ name: name.trim(), quantity: toInt(quantity), threshold: toInt(threshold) })}
            disabled={busy || !name.trim()}
          >
            {busy ? "Saving..." : "Save"}
          </button>
        </div>
      }
    >
      <div className="formRow">
        <div className="field">
          <label>Item Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sterile Gauze (Pack of 50)" />
        </div>
        <div className="field">
          <label>Quantity</label>
          <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
        <div className="field">
          <label>Threshold</label>
          <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function VendorModal({ data, onClose, onCreate, onUpdate, onDelete, onRefresh, busy }) {
  const { item, vendors } = data;
  const [vName, setVName] = useState("");
  const [vContact, setVContact] = useState("");

  return (
    <Modal
      title={`Vendors • ${item.name}`}
      onClose={onClose}
      footer={
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <button className="btn" onClick={onRefresh} disabled={busy}>
            Refresh
          </button>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v._id}>
              <td style={{ fontWeight: 600 }}>{v.name}</td>
              <td style={{ color: "var(--muted)" }}>{v.contact}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button
                  className="btn"
                  onClick={() => {
                    const newName = prompt("Vendor name", v.name);
                    if (newName === null) return;
                    const newContact = prompt("Vendor contact", v.contact);
                    if (newContact === null) return;
                    onUpdate(v._id, { name: newName.trim(), contact: newContact.trim() });
                  }}
                  disabled={busy}
                >
                  Edit
                </button>{" "}
                <button
                  className="btn btnDanger"
                  onClick={() => {
                    if (!confirm(`Delete vendor "${v.name}"?`)) return;
                    onDelete(v._id);
                  }}
                  disabled={busy}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {!vendors.length && (
            <tr>
              <td colSpan={3} style={{ color: "var(--muted)" }}>
                No vendors for this item yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ height: 12 }} />
      <div className="card" style={{ boxShadow: "none", background: "rgba(255,255,255,0.03)" }}>
        <div className="cardHeader">
          <strong>Add Vendor</strong>
        </div>
        <div className="cardBody">
          <div className="formRow" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>Vendor Name</label>
              <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="e.g., MedSupply Co." />
            </div>
            <div className="field">
              <label>Contact</label>
              <input value={vContact} onChange={(e) => setVContact(e.target.value)} placeholder="email | phone" />
            </div>
          </div>
          <button
            className="btn btnPrimary"
            disabled={busy || !vName.trim() || !vContact.trim()}
            onClick={async () => {
              await onCreate({ name: vName.trim(), contact: vContact.trim() });
              setVName("");
              setVContact("");
            }}
          >
            {busy ? "Adding..." : "Add Vendor"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

