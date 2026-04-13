const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    threshold: { type: Number, required: true, min: 0 },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

itemSchema.index({ departmentId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Item", itemSchema);

