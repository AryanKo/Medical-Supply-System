import api from "./api";
import { clearAdmin, clearToken, setAdmin, setToken } from "./storage";

export async function login(username, password) {
  const res = await api.post("/auth/login", { username, password });
  setToken(res.data.token);
  setAdmin(res.data.admin);
  return res.data.admin;
}

export function logout() {
  clearToken();
  clearAdmin();
}

