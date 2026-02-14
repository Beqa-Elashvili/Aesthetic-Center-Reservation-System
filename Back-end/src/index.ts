require("dotenv").config();
import express from "express";
import cors from "cors";
import servicesRoutes from "./routes/servicesRoutes";
import reservationsRoutes from "./routes/reservationsRoutes";
import staffRoutes from "./routes/staffRoutes";
import { syncDb } from "./config/db";
import { Specialist } from "./models/staf/Staf";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


syncDb()
app.use("/api/staff", staffRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/reservations", reservationsRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
