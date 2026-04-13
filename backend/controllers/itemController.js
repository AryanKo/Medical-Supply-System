const { validationResult } = require("express-validator");
const Item = require("../models/Item");
const Department = require("../models/Department");

async function listItems(req, res) {
  const { departmentId } = req.query;
  const filter = {};
  if (departmentId) filter.departmentId = departmentId;

  const items = await Item.find(filter).sort({ name: 1 });
  return res.json(items);
}

async function createItem(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const { name, quantity, threshold, departmentId } = req.body;
  const dept = await Department.findById(departmentId);
  if (!dept) return res.status(400).json({ message: "Invalid departmentId" });

  try {
    const item = await Item.create({ name, quantity, threshold, departmentId });
    return res.status(201).json(item);
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ message: "Item with this name already exists in department" });
    }
    throw e;
  }
}

async function updateItem(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const { name, quantity, threshold } = req.body;
  if (name !== undefined) item.name = name;
  if (quantity !== undefined) item.quantity = quantity;
  if (threshold !== undefined) item.threshold = threshold;

  try {
    await item.save();
    return res.json(item);
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ message: "Item with this name already exists in department" });
    }
    throw e;
  }
}

async function deleteItem(req, res) {
  const item = await Item.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  await item.deleteOne();
  return res.json({ message: "Deleted" });
}

module.exports = { listItems, createItem, updateItem, deleteItem };

