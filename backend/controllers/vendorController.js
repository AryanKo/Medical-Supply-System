const { validationResult } = require("express-validator");
const Vendor = require("../models/Vendor");
const Item = require("../models/Item");

async function listVendors(req, res) {
  const { itemId } = req.query;
  const filter = {};
  if (itemId) filter.itemId = itemId;
  const vendors = await Vendor.find(filter).sort({ name: 1 });
  return res.json(vendors);
}

async function createVendor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const { name, contact, itemId } = req.body;
  const item = await Item.findById(itemId);
  if (!item) return res.status(400).json({ message: "Invalid itemId" });

  try {
    const vendor = await Vendor.create({ name, contact, itemId });
    return res.status(201).json(vendor);
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ message: "Vendor with this name already exists for item" });
    }
    throw e;
  }
}

async function updateVendor(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });

  const { name, contact } = req.body;
  if (name !== undefined) vendor.name = name;
  if (contact !== undefined) vendor.contact = contact;

  try {
    await vendor.save();
    return res.json(vendor);
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ message: "Vendor with this name already exists for item" });
    }
    throw e;
  }
}

async function deleteVendor(req, res) {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return res.status(404).json({ message: "Vendor not found" });
  await vendor.deleteOne();
  return res.json({ message: "Deleted" });
}

module.exports = { listVendors, createVendor, updateVendor, deleteVendor };

