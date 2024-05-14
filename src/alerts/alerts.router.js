"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRouter = void 0;
const express_1 = __importDefault(require("express"));
const alerts_controller_1 = require("./alerts.controller");
const router = express_1.default.Router();
exports.alertsRouter = router;
const alertsController = new alerts_controller_1.AlertsController();
router.get("/:type", alertsController.getAlertsByType);
router.get("/severity/:severity", alertsController.getAlertsBySeverity);
