require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./routes/auth");
const jobs = require("./routes/jobs");
const status = require("./routes/status");

app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", auth);
app.use("/api/jobs", jobs);
app.use("/api/jobs/:jobId/status", status);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
