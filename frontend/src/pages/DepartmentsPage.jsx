import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDepartments } from "../services/hospify";
import { useToast } from "../components/Toast";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchDepartments();
        if (alive) setDepartments(data);
      } catch (err) {
        toast.push(err?.response?.data?.message || "Failed to load departments", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [toast]);

  return (
    <>
      <div className="topbar">
        <div className="pageTitle">
          <h1>Departments</h1>
          <p>Enter a department to manage its inventory and vendors per item.</p>
        </div>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate("/")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid">
        <section className="card">
          <div className="cardHeader">
            <strong>Available Departments</strong>
            <span className="pill">{departments.length}</span>
          </div>
          <div className="cardBody">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btnPrimary" onClick={() => navigate(`/departments/${d._id}`)}>
                        Enter
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && departments.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ color: "var(--muted)" }}>
                      No departments found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={2} style={{ color: "var(--muted)" }}>
                      Loading...
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

