const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { connectDb } = require("./config/db");
const { ensureSeedData } = require("./config/seed");
const { requireAuth } = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: false,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", require("./routes/auth"));
app.use("/dashboard", requireAuth, require("./routes/dashboard"));
app.use("/departments", requireAuth, require("./routes/departments"));
app.use("/items", requireAuth, require("./routes/items"));
app.use("/vendors", requireAuth, require("./routes/vendors"));
app.use("/orders", requireAuth, require("./routes/orders"));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Avoid leaking internal details; log server-side for debugging
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

async function start() {
  await connectDb(process.env.MONGO_URI);
  await ensureSeedData();

  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`Hospify API running on :${port}`));
}

start().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});

