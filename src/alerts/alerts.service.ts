import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AlertsService {
  getAlertsByType = async (type: string) => {
    const alertType = await prisma.alertType.findUnique({
      where: {
        tipo: type,
      },
    });

    if (!alertType) {
      throw new Error("Tipo de alerta no encontrado");
    }

    const alerts = await prisma.alert.findMany({
      where: {
        alertTypeId: alertType.id,
      },
      include: {
        alertSeverity: true,
      },
    });

    const severityCounts = alerts.reduce(
      (counts: { [key: string]: number }, alert) => {
        if (!counts[alert.alertSeverity.severity]) {
          counts[alert.alertSeverity.severity] = 0;
        }
        counts[alert.alertSeverity.severity]++;
        return counts;
      },
      {}
    );

    return severityCounts;
  };

  getAlertsBySeverity = async (severity: string) => {
    const alertSeverity = await prisma.alertSeverity.findUnique({
      where: {
        severity: severity,
      },
    });

    if (!alertSeverity) {
      throw new Error("Severidad de alerta no encontrada");
    }

    const alerts = await prisma.alert.findMany({
      where: {
        alertSeverityId: alertSeverity.id,
      },
    });

    return alerts.length;
  };
}
