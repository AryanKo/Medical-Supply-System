const express = require("express");
const { body } = require("express-validator");
const { listItems, createItem, updateItem, deleteItem } = require("../controllers/itemController");

const router = express.Router();

router.get("/", listItems);

router.post(
  "/",
  [
    body("name").isString().trim().notEmpty(),
    body("quantity").isInt({ min: 0 }).toInt(),
    body("threshold").isInt({ min: 0 }).toInt(),
    body("departmentId").isString().notEmpty(),
  ],
  createItem
);

router.put(
  "/:id",
  [
    body("name").optional().isString().trim().notEmpty(),
    body("quantity").optional().isInt({ min: 0 }).toInt(),
    body("threshold").optional().isInt({ min: 0 }).toInt(),
  ],
  updateItem
);

router.delete("/:id", deleteItem);

module.exports = router;

