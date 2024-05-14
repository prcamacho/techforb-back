"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plantsRouter = void 0;
const express_1 = __importDefault(require("express"));
const plants_controller_1 = require("./plants.controller");
const router = express_1.default.Router();
exports.plantsRouter = router;
const plantsController = new plants_controller_1.PlantsController();
router.post("/", plantsController.createPlant);
router.post("/createAlerts", plantsController.createAlerts);
router.get("/alerts", plantsController.getPlantAlerts);
router.delete("/:name", plantsController.deletePlant);
