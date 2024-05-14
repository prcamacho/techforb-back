// src/app.ts
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { authRouter } from "./auth/auth.router";
import { alertsRouter } from "./alerts/alerts.router";
import { plantsRouter } from "./plants/plants.router";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors(), express.json());

app.use("/auth", authRouter);
app.use("/alerts", alertsRouter);
app.use("/plants", plantsRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;