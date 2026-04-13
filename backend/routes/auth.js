const express = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  [body("username").isString().trim().notEmpty(), body("password").isString().notEmpty()],
  login
);

module.exports = router;

