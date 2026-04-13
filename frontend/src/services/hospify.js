import api from "./api";

export async function fetchDashboardSummary() {
  const res = await api.get("/dashboard/summary");
  return res.data;
}

export async function fetchDepartments() {
  const res = await api.get("/departments");
  return res.data;
}

export async function fetchItems(departmentId) {
  const res = await api.get("/items", { params: departmentId ? { departmentId } : {} });
  return res.data;
}

export async function createItem(payload) {
  const res = await api.post("/items", payload);
  return res.data;
}

export async function updateItem(id, payload) {
  const res = await api.put(`/items/${id}`, payload);
  return res.data;
}

export async function deleteItem(id) {
  const res = await api.delete(`/items/${id}`);
  return res.data;
}

export async function fetchVendors(itemId) {
  const res = await api.get("/vendors", { params: itemId ? { itemId } : {} });
  return res.data;
}

export async function createVendor(payload) {
  const res = await api.post("/vendors", payload);
  return res.data;
}

export async function updateVendor(id, payload) {
  const res = await api.put(`/vendors/${id}`, payload);
  return res.data;
}

export async function deleteVendor(id) {
  const res = await api.delete(`/vendors/${id}`);
  return res.data;
}

export async function fetchOrders(status) {
  const res = await api.get("/orders", { params: status ? { status } : {} });
  return res.data;
}

export async function createOrder(payload) {
  const res = await api.post("/orders", payload);
  return res.data;
}

export async function completeOrder(orderId) {
  const res = await api.patch(`/orders/${orderId}/complete`);
  return res.data;
}

