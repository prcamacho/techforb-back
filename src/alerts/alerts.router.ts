import express from "express";
import { AlertsController } from "./alerts.controller";

const router = express.Router();
const alertsController = new AlertsController();

router.get("/:type", alertsController.getAlertsByType);
router.get("/severity/:severity", alertsController.getAlertsBySeverity);

export { router as alertsRouter };
