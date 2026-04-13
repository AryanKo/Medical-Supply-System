import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createOrder, fetchDepartments, fetchItems, fetchVendors } from "../services/hospify";
import { useToast } from "../components/Toast";

export default function PlaceOrderPage() {
  const [params] = useSearchParams();
  const itemId = params.get("itemId") || "";
  const departmentId = params.get("departmentId") || "";

  const toast = useToast();
  const navigate = useNavigate();

  const [dept, setDept] = useState(null);
  const [item, setItem] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [depts, items, vends] = await Promise.all([
          fetchDepartments(),
          fetchItems(departmentId),
          fetchVendors(itemId),
        ]);
        if (!alive) return;
        const foundDept = depts.find((d) => d._id === departmentId) || null;
        const foundItem = items.find((i) => i._id === itemId) || null;
        setDept(foundDept);
        setItem(foundItem);
        setVendors(vends);
        setVendorId(vends[0]?._id || "");
        setQuantity(1);
      } catch (err) {
        toast.push(err?.response?.data?.message || "Failed to load order data", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [departmentId, itemId, toast]);

  const selectedVendor = useMemo(() => vendors.find((v) => v._id === vendorId) || null, [vendors, vendorId]);

  return (
    <>
      <div className="topbar">
        <div className="pageTitle">
          <h1>Place Order</h1>
          <p>Create a pending order for a low-stock item.</p>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="btn" onClick={() => navigate("/")}>
            Dashboard
          </button>
        </div>
      </div>

      <div className="grid">
        <section className="card">
          <div className="cardHeader">
            <strong>Order Details</strong>
            <span className="pill">{loading ? "Loading..." : "Ready"}</span>
          </div>
          <div className="cardBody">
            {!item || !dept ? (
              <div style={{ color: "var(--muted)" }}>
                {loading ? "Loading order context..." : "Missing item or department context."}
              </div>
            ) : (
              <>
                <div className="formRow" style={{ marginBottom: 12 }}>
                  <div className="field">
                    <label>Department</label>
                    <input value={dept.name} readOnly />
                  </div>
                  <div className="field">
                    <label>Item</label>
                    <input value={item.name} readOnly />
                  </div>
                </div>

                <div className="formRow" style={{ marginBottom: 12 }}>
                  <div className="field">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value || 1))}
                    />
                  </div>
                  <div className="field">
                    <label>Vendor</label>
                    <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name}
                        </option>
                      ))}
                      {!vendors.length && <option value="">No vendors available</option>}
                    </select>
                  </div>
                </div>

                <div className="card" style={{ boxShadow: "none", background: "rgba(255,255,255,0.03)" }}>
                  <div className="cardHeader">
                    <strong>Vendor Details</strong>
                  </div>
                  <div className="cardBody">
                    {selectedVendor ? (
                      <>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{selectedVendor.name}</div>
                        <div style={{ color: "var(--muted)" }}>{selectedVendor.contact}</div>
                      </>
                    ) : (
                      <div style={{ color: "var(--muted)" }}>Select a vendor to view details.</div>
                    )}
                  </div>
                </div>

                <div style={{ height: 12 }} />
                <div className="toolbar" style={{ justifyContent: "flex-end" }}>
                  <button
                    className="btn btnPrimary"
                    disabled={busy || !vendorId || !Number.isFinite(quantity) || quantity < 1}
                    onClick={async () => {
                      try {
                        setBusy(true);
                        await createOrder({
                          itemId,
                          departmentId,
                          vendorId,
                          quantity: Number(quantity),
                        });
                        toast.push("Order created (pending).", "success");
                        navigate("/", { replace: true });
                      } catch (err) {
                        toast.push(err?.response?.data?.message || "Order creation failed", "error");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "Placing..." : "Confirm Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

