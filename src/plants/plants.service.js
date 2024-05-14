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
exports.PlantsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlantsService {
    constructor() {
        this.createPlant = (name, country) => __awaiter(this, void 0, void 0, function* () {
            const existingPlant = yield prisma.plant.findUnique({
                where: {
                    name: name,
                },
            });
            if (existingPlant) {
                throw new Error(`La planta ${name} ya existe`);
            }
            const newPlant = yield prisma.plant.create({
                data: {
                    name: name,
                    country: country,
                },
            });
            return newPlant;
        });
        this.createAlerts = (name, country, alertSeverities) => __awaiter(this, void 0, void 0, function* () {
            const plant = yield prisma.plant.findUnique({
                where: {
                    name,
                },
            });
            if (!plant) {
                throw new Error(`La planta ${name} no existe`);
            }
            const alertTypes = yield prisma.alertType.findMany();
            yield prisma.alert.deleteMany({
                where: {
                    plantId: plant.id,
                },
            });
            for (let alertSeverity of alertSeverities) {
                const { severity, count } = alertSeverity;
                const alertSeverityRecord = yield prisma.alertSeverity.findUnique({
                    where: {
                        severity,
                    },
                });
                if (!alertSeverityRecord) {
                    throw new Error(`AlertSeverity ${severity} does not exist`);
                }
                for (let i = 0; i < count; i++) {
                    const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
                    yield prisma.alert.create({
                        data: {
                            plantId: plant.id,
                            alertTypeId: randomAlertType.id,
                            alertSeverityId: alertSeverityRecord.id,
                        },
                    });
                }
            }
        });
        this.getPlantAlerts = () => __awaiter(this, void 0, void 0, function* () {
            const plants = yield prisma.plant.findMany({
                include: {
                    alerts: {
                        include: {
                            alertSeverity: true,
                        },
                    },
                },
            });
            const plantAlerts = plants.map((plant) => {
                const severityCounts = plant.alerts.reduce((counts, alert) => {
                    if (!counts[alert.alertSeverity.severity]) {
                        counts[alert.alertSeverity.severity] = 0;
                    }
                    counts[alert.alertSeverity.severity]++;
                    return counts;
                }, {});
                return {
                    name: plant.name,
                    country: plant.country,
                    totalAlerts: plant.alerts.length,
                    severityCounts,
                };
            });
            return plantAlerts;
        });
        this.deletePlant = (name) => __awaiter(this, void 0, void 0, function* () {
            const plant = yield prisma.plant.findUnique({
                where: {
                    name,
                },
            });
            if (!plant) {
                throw new Error("Planta no encontrada");
            }
            yield prisma.alert.deleteMany({
                where: {
                    plantId: plant.id,
                },
            });
            yield prisma.plant.delete({
                where: {
                    id: plant.id,
                },
            });
        });
    }
}
exports.PlantsService = PlantsService;
