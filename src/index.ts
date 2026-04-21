import express from "express";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";
import { contactRouter } from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

const ALLOWED_ORIGINS = [
  "https://ianskelskey.github.io",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:5173"] : []),
];

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, Render health checks)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
  }),
);

// Limit body size to guard against oversized payloads
app.use(express.json({ limit: "16kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/contact", contactRouter);

app.listen(PORT, () => {
  console.log(`portfolio-server listening on port ${PORT}`);
});
