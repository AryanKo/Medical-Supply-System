const express = require("express");
const { body } = require("express-validator");
const {
  listVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} = require("../controllers/vendorController");

const router = express.Router();

router.get("/", listVendors);

router.post(
  "/",
  [
    body("name").isString().trim().notEmpty(),
    body("contact").isString().trim().notEmpty(),
    body("itemId").isString().notEmpty(),
  ],
  createVendor
);

router.put(
  "/:id",
  [
    body("name").optional().isString().trim().notEmpty(),
    body("contact").optional().isString().trim().notEmpty(),
  ],
  updateVendor
);

router.delete("/:id", deleteVendor);

module.exports = router;

