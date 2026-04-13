const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Department = require("../models/Department");
const Item = require("../models/Item");
const Vendor = require("../models/Vendor");

async function ensureSeedData() {
  if (String(process.env.SEED).toLowerCase() !== "true") return;

  const [adminCount, deptCount] = await Promise.all([
    Admin.countDocuments(),
    Department.countDocuments(),
  ]);

  if (adminCount === 0) {
    const username = process.env.ADMIN_SEED_USERNAME;
    const password = process.env.ADMIN_SEED_PASSWORD;
    if (!username || !password) {
      throw new Error(
        "SEED=true but missing ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD"
      );
    }
    const hashed = await bcrypt.hash(password, 12);
    await Admin.create({ username, password: hashed });
  }

  if (deptCount === 0) {
    await Department.insertMany([
      { name: "Radiology" },
      { name: "Cardiology" },
      { name: "Pediatrics" },
    ]);
  }

  const itemCount = await Item.countDocuments();
  if (itemCount > 0) return;

  const depts = await Department.find().lean();
  const byName = Object.fromEntries(depts.map((d) => [d.name, d]));

  const items = await Item.insertMany([
    {
      name: "X-Ray Film (14x17)",
      quantity: 18,
      threshold: 25,
      departmentId: byName.Radiology._id,
    },
    {
      name: "Ultrasound Gel (500ml)",
      quantity: 42,
      threshold: 20,
      departmentId: byName.Radiology._id,
    },
    {
      name: "ECG Electrodes (Pack of 50)",
      quantity: 9,
      threshold: 15,
      departmentId: byName.Cardiology._id,
    },
    {
      name: "Syringes (5ml, Box of 100)",
      quantity: 120,
      threshold: 60,
      departmentId: byName.Pediatrics._id,
    },
    {
      name: "Pediatric IV Cannula (24G, Pack of 20)",
      quantity: 7,
      threshold: 12,
      departmentId: byName.Pediatrics._id,
    },
  ]);

  const itemByName = Object.fromEntries(items.map((i) => [i.name, i]));

  await Vendor.insertMany([
    {
      name: "MedSupply Co.",
      contact: "sales@medsupplyco.example | +1 (555) 010-2201",
      itemId: itemByName["X-Ray Film (14x17)"]._id,
    },
    {
      name: "Radiant Imaging Supplies",
      contact: "orders@radiantimg.example | +1 (555) 010-8842",
      itemId: itemByName["X-Ray Film (14x17)"]._id,
    },
    {
      name: "CarePlus Disposables",
      contact: "careplus@supplies.example | +1 (555) 010-3310",
      itemId: itemByName["ECG Electrodes (Pack of 50)"]._id,
    },
    {
      name: "PediaLine Medical",
      contact: "support@pedialine.example | +1 (555) 010-7799",
      itemId: itemByName["Pediatric IV Cannula (24G, Pack of 20)"]._id,
    },
    {
      name: "Clinic Essentials",
      contact: "hello@clinicessentials.example | +1 (555) 010-1444",
      itemId: itemByName["Syringes (5ml, Box of 100)"]._id,
    },
    {
      name: "GelWorks Healthcare",
      contact: "team@gelworks.example | +1 (555) 010-6655",
      itemId: itemByName["Ultrasound Gel (500ml)"]._id,
    },
  ]);
}

module.exports = { ensureSeedData };

