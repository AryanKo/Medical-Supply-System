const Department = require("../models/Department");

async function listDepartments(req, res) {
  const depts = await Department.find().sort({ name: 1 });
  return res.json(depts);
}

async function getDepartment(req, res) {
  const dept = await Department.findById(req.params.id);
  if (!dept) return res.status(404).json({ message: "Department not found" });
  return res.json(dept);
}

module.exports = { listDepartments, getDepartment };

