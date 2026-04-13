const Item = require("../models/Item");
const Order = require("../models/Order");
const Department = require("../models/Department");

async function getSummary(req, res) {
  const [departments, lowStock, pendingOrders] = await Promise.all([
    Department.find().sort({ name: 1 }),
    Item.find({ $expr: { $lt: ["$quantity", "$threshold"] } })
      .populate("departmentId", "name")
      .sort({ updatedAt: -1 }),
    Order.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("itemId", "name")
      .populate("departmentId", "name")
      .populate("vendorId", "name contact"),
  ]);

  return res.json({
    departments,
    lowStock: lowStock.map((i) => ({
      _id: i._id,
      name: i.name,
      quantity: i.quantity,
      threshold: i.threshold,
      department: i.departmentId ? { _id: i.departmentId._id, name: i.departmentId.name } : null,
      departmentId: i.departmentId ? i.departmentId._id : i.departmentId,
    })),
    pendingOrders,
  });
}

module.exports = { getSummary };

