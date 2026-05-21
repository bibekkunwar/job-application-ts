require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const auth = require("./routes/auth");
const jobs = require("./routes/jobs");
const status = require("./routes/status");

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (e.g. server-to-server, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
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
