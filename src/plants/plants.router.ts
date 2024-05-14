import express from "express";
import { PlantsController } from "./plants.controller";

const router = express.Router();
const plantsController = new PlantsController();

router.post("/", plantsController.createPlant);
router.post("/createAlerts", plantsController.createAlerts);
router.get("/alerts", plantsController.getPlantAlerts);
router.delete("/:name", plantsController.deletePlant);

export { router as plantsRouter };
