const { validationResult } = require("express-validator");
const Order = require("../models/Order");
const Item = require("../models/Item");
const Department = require("../models/Department");
const Vendor = require("../models/Vendor");

async function listOrders(req, res) {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("itemId", "name")
    .populate("departmentId", "name")
    .populate("vendorId", "name contact");

  return res.json(orders);
}

async function createOrder(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const { itemId, departmentId, quantity, vendorId } = req.body;

  const [item, dept, vendor] = await Promise.all([
    Item.findById(itemId),
    Department.findById(departmentId),
    Vendor.findById(vendorId),
  ]);

  if (!item) return res.status(400).json({ message: "Invalid itemId" });
  if (!dept) return res.status(400).json({ message: "Invalid departmentId" });
  if (!vendor) return res.status(400).json({ message: "Invalid vendorId" });
  if (String(item.departmentId) !== String(departmentId)) {
    return res.status(400).json({ message: "Item does not belong to department" });
  }
  if (String(vendor.itemId) !== String(itemId)) {
    return res.status(400).json({ message: "Vendor does not supply this item" });
  }

  const order = await Order.create({
    itemId,
    departmentId,
    quantity,
    vendorId,
    status: "pending",
  });

  const populated = await Order.findById(order._id)
    .populate("itemId", "name")
    .populate("departmentId", "name")
    .populate("vendorId", "name contact");

  return res.status(201).json(populated);
}

async function completeOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id, status: "pending" });
  if (!order) return res.status(404).json({ message: "Pending order not found" });

  const item = await Item.findById(order.itemId);
  if (!item) return res.status(400).json({ message: "Order item no longer exists" });

  item.quantity += order.quantity;
  await item.save();

  order.status = "completed";
  await order.save();

  const populated = await Order.findById(order._id)
    .populate("itemId", "name")
    .populate("departmentId", "name")
    .populate("vendorId", "name contact");

  return res.json({
    message: "Order completed and stock updated",
    order: populated,
    item: { _id: item._id, quantity: item.quantity },
  });
}

module.exports = { listOrders, createOrder, completeOrder };

