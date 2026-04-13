const express = require("express");
const { listDepartments, getDepartment } = require("../controllers/departmentController");

const router = express.Router();

router.get("/", listDepartments);
router.get("/:id", getDepartment);

module.exports = router;

