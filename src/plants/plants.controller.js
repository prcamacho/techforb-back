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
exports.PlantsController = void 0;
const plants_service_1 = require("./plants.service");
class PlantsController {
    constructor() {
        this.plantsService = new plants_service_1.PlantsService();
        this.createPlant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { name, country } = req.body;
            try {
                const newPlant = yield this.plantsService.createPlant(name, country);
                res.json(newPlant);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.createAlerts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { name, country, alertSeverities } = req.body;
            try {
                yield this.plantsService.createAlerts(name, country, alertSeverities);
                res.status(200).json({ message: "Alertas creadas correctamente" });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.getPlantAlerts = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const plantAlerts = yield this.plantsService.getPlantAlerts();
                res.json(plantAlerts);
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        this.deletePlant = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { name } = req.params;
            try {
                yield this.plantsService.deletePlant(name);
                res.json({ message: "Planta y sus alertas eliminadas con éxito" });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
}
exports.PlantsController = PlantsController;
