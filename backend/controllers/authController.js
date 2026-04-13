const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Invalid input", errors: errors.array() });
  }

  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { username: admin.username },
    process.env.JWT_SECRET,
    { subject: String(admin._id), expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  return res.json({
    token,
    admin: { id: String(admin._id), username: admin.username },
  });
}

module.exports = { login };

