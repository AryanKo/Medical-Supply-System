import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeOrder, fetchDashboardSummary } from "../services/hospify";
import { useToast } from "../components/Toast";

function formatWhen(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardSummary();
        if (alive) setSummary(data);
      } catch (err) {
        toast.push(err?.response?.data?.message || "Failed to load dashboard", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [toast]);

  const departments = summary?.departments || [];
  const lowStock = summary?.lowStock || [];
  const pendingOrders = summary?.pendingOrders || [];

  const deptPills = useMemo(() => {
    return departments.map((d) => (
      <span key={d._id} className="pill">
        {d.name}
      </span>
    ));
  }, [departments]);

  return (
    <>
      <div className="topbar">
        <div className="pageTitle">
          <h1>Dashboard</h1>
          <p>Low-stock alerts and pending orders update on every page load.</p>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate("/departments")}>
            Go to Departments
          </button>
          <button
            className="btn"
            onClick={async () => {
              setLoading(true);
              try {
                setSummary(await fetchDashboardSummary());
                toast.push("Dashboard refreshed.", "success");
              } catch (err) {
                toast.push(err?.response?.data?.message || "Refresh failed", "error");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid">
        <section className="card" style={{ gridColumn: "span 12" }}>
          <div className="cardHeader">
            <strong>Departments</strong>
            <span className={departments.length ? "pill pillOk" : "pill"}>{departments.length} total</span>
          </div>
          <div className="cardBody" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {deptPills}
            {!departments.length && <span className="pill">No departments found</span>}
          </div>
        </section>

        <section className="card" style={{ gridColumn: "span 12" }}>
          <div className="cardHeader">
            <strong>Low Stock Alerts</strong>
            <span className={lowStock.length ? "pill pillWarn" : "pill pillOk"}>
              {lowStock.length ? `${lowStock.length} attention` : "All good"}
            </span>
          </div>
          <div className="cardBody">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Department</th>
                  <th>Qty</th>
                  <th>Threshold</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((i) => (
                  <tr key={i._id}>
                    <td>{i.name}</td>
                    <td>{i.department?.name || "-"}</td>
                    <td>
                      <span className="pill pillWarn">{i.quantity}</span>
                    </td>
                    <td>{i.threshold}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btnPrimary"
                        onClick={() =>
                          navigate(`/orders/new?itemId=${encodeURIComponent(i._id)}&departmentId=${encodeURIComponent(i.departmentId)}`)
                        }
                      >
                        Place Order
                      </button>
                    </td>
                  </tr>
                ))}
                {!lowStock.length && (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--muted)" }}>
                      No alerts right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" style={{ gridColumn: "span 12" }}>
          <div className="cardHeader">
            <strong>Pending Orders</strong>
            <span className="pill">{pendingOrders.length} pending</span>
          </div>
          <div className="cardBody">
            <table className="table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Department</th>
                  <th>Item</th>
                  <th>Vendor</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((o) => (
                  <tr key={o._id}>
                    <td>{formatWhen(o.createdAt)}</td>
                    <td>{o.departmentId?.name || "-"}</td>
                    <td>{o.itemId?.name || "-"}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.vendorId?.name || "-"}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{o.vendorId?.contact || ""}</div>
                    </td>
                    <td>{o.quantity}</td>
                    <td>
                      <span className="pill">{o.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btnPrimary"
                        disabled={Boolean(completingId) || loading}
                        onClick={async () => {
                          try {
                            setCompletingId(o._id);
                            await completeOrder(o._id);
                            setSummary(await fetchDashboardSummary());
                            toast.push("Order marked completed. Inventory updated.", "success");
                          } catch (err) {
                            toast.push(err?.response?.data?.message || "Failed to complete order", "error");
                          } finally {
                            setCompletingId("");
                          }
                        }}
                      >
                        {completingId === o._id ? "Completing..." : "Completed"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!pendingOrders.length && (
                  <tr>
                    <td colSpan={7} style={{ color: "var(--muted)" }}>
                      No pending orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

