const express = require("express");
const { body } = require("express-validator");
const { listOrders, createOrder, completeOrder } = require("../controllers/orderController");

const router = express.Router();

router.get("/", listOrders);

router.post(
  "/",
  [
    body("itemId").isString().notEmpty(),
    body("departmentId").isString().notEmpty(),
    body("vendorId").isString().notEmpty(),
    body("quantity").isInt({ min: 1 }).toInt(),
  ],
  createOrder
);

router.patch("/:id/complete", completeOrder);

module.exports = router;

