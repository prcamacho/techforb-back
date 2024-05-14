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
exports.AlertsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AlertsService {
    constructor() {
        this.getAlertsByType = (type) => __awaiter(this, void 0, void 0, function* () {
            const alertType = yield prisma.alertType.findUnique({
                where: {
                    tipo: type,
                },
            });
            if (!alertType) {
                throw new Error("Tipo de alerta no encontrado");
            }
            const alerts = yield prisma.alert.findMany({
                where: {
                    alertTypeId: alertType.id,
                },
                include: {
                    alertSeverity: true,
                },
            });
            const severityCounts = alerts.reduce((counts, alert) => {
                if (!counts[alert.alertSeverity.severity]) {
                    counts[alert.alertSeverity.severity] = 0;
                }
                counts[alert.alertSeverity.severity]++;
                return counts;
            }, {});
            return severityCounts;
        });
        this.getAlertsBySeverity = (severity) => __awaiter(this, void 0, void 0, function* () {
            const alertSeverity = yield prisma.alertSeverity.findUnique({
                where: {
                    severity: severity,
                },
            });
            if (!alertSeverity) {
                throw new Error("Severidad de alerta no encontrada");
            }
            const alerts = yield prisma.alert.findMany({
                where: {
                    alertSeverityId: alertSeverity.id,
                },
            });
            return alerts.length;
        });
    }
}
exports.AlertsService = AlertsService;
