import express from "express";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ ok: true, service: "api" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
