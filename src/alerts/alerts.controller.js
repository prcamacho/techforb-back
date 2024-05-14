"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsController = void 0;
const alerts_service_1 = require("./alerts.service");
class AlertsController {
    constructor() {
        this.alertsService = new alerts_service_1.AlertsService();
        this.getAlertsByType = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { type } = req.params;
            try {
                const severityCounts = yield this.alertsService.getAlertsByType(type);
                res.json(severityCounts);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.getAlertsBySeverity = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { severity } = req.params;
            try {
                const count = yield this.alertsService.getAlertsBySeverity(severity);
                res.json({ count });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.AlertsController = AlertsController;
