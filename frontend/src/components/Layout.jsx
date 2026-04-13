import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAdmin } from "../services/storage";
import { logout } from "../services/auth";
import { useToast } from "./Toast";

export default function Layout() {
  const admin = getAdmin();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark" />
          <div className="brandTitle">
            <strong>Hospify</strong>
            <span>Inventory & Orders</span>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/departments">Departments</NavLink>
        </nav>

        <div className="sidebarFooter">
          <div className="pill" style={{ width: "100%", justifyContent: "space-between" }}>
            <span style={{ color: "var(--muted)" }}>Signed in</span>
            <span>{admin?.username || "admin"}</span>
          </div>
          <div style={{ height: 10 }} />
          <button
            className="btn btnDanger"
            style={{ width: "100%" }}
            onClick={() => {
              logout();
              toast.push("You have been logged out.", "success");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

