import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useToast } from "../components/Toast";
import { getToken } from "../services/storage";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const alreadyAuthed = useMemo(() => Boolean(getToken()), []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (alreadyAuthed) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.push("Welcome back. You're signed in.", "success");
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      toast.push(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 0.2,
              background: "linear-gradient(135deg, var(--brand-2), var(--brand))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 6,
            }}
          >
            Hospify - Medical Inventory Management System
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>Developed by Aryan</div>
        </div>

        <h1 style={{ marginTop: 0 }}>Admin Login</h1>
        <p>Sign in to manage departments, inventory, vendors, and orders.</p>

        <form onSubmit={onSubmit}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btnPrimary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

