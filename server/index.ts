import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

registerRoutes(app);

// In production, serve the built client
if (process.env.NODE_ENV === "production") {
  const clientPath = path.resolve(__dirname, "public");
  app.use(express.static(clientPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Starlink Health Tracker API running on port ${PORT}`);
});
