import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PlantsService {
  createPlant = async (name: string, country: string) => {
    const existingPlant = await prisma.plant.findUnique({
      where: {
        name: name,
      },
    });

    if (existingPlant) {
      throw new Error(`La planta ${name} ya existe`);
    }

    const newPlant = await prisma.plant.create({
      data: {
        name: name,
        country: country,
      },
    });

    return newPlant;
  };

  createAlerts = async (name: string, country: string, alertSeverities: any[]) => {
    const plant = await prisma.plant.findUnique({
      where: {
        name,
      },
    });

    if (!plant) {
      throw new Error(`La planta ${name} no existe`);
    }

    const alertTypes = await prisma.alertType.findMany();

    await prisma.alert.deleteMany({
      where: {
        plantId: plant.id,
      },
    });

    for (let alertSeverity of alertSeverities) {
      const { severity, count } = alertSeverity;

      const alertSeverityRecord = await prisma.alertSeverity.findUnique({
        where: {
          severity,
        },
      });

      if (!alertSeverityRecord) {
        throw new Error(`AlertSeverity ${severity} does not exist`);
      }

      for (let i = 0; i < count; i++) {
        const randomAlertType =
          alertTypes[Math.floor(Math.random() * alertTypes.length)];

        await prisma.alert.create({
          data: {
            plantId: plant.id,
            alertTypeId: randomAlertType.id,
            alertSeverityId: alertSeverityRecord.id,
          },
        });
      }
    }
  };

  getPlantAlerts = async () => {
    const plants = await prisma.plant.findMany({
      include: {
        alerts: {
          include: {
            alertSeverity: true,
          },
        },
      },
    });

    const plantAlerts = plants.map((plant) => {
      const severityCounts = plant.alerts.reduce(
        (counts: Record<string, number>, alert) => {
          if (!counts[alert.alertSeverity.severity]) {
            counts[alert.alertSeverity.severity] = 0;
          }
          counts[alert.alertSeverity.severity]++;
          return counts;
        },
        {} as Record<string, number>
      );

      return {
        name: plant.name,
        country: plant.country,
        totalAlerts: plant.alerts.length,
        severityCounts,
      };
    });

    return plantAlerts;
  };

  deletePlant = async (name: string) => {
    const plant = await prisma.plant.findUnique({
      where: {
        name,
      },
    });

    if (!plant) {
      throw new Error("Planta no encontrada");
    }
    await prisma.alert.deleteMany({
      where: {
        plantId: plant.id,
      },
    });
    await prisma.plant.delete({
      where: {
        id: plant.id,
      },
    });
  };
}
