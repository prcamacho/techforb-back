import { Request, Response } from "express";
import { PlantsService } from "./plants.service";

export class PlantsController {
  private plantsService = new PlantsService();

  createPlant = async (req: Request, res: Response) => {
    const { name, country } = req.body;
    try {
      const newPlant = await this.plantsService.createPlant(name, country);
      res.json(newPlant);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  createAlerts = async (req: Request, res: Response) => {
    const { name, country, alertSeverities } = req.body;
    try {
      await this.plantsService.createAlerts(name, country, alertSeverities);
      res.status(200).json({ message: "Alertas creadas correctamente" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getPlantAlerts = async (req: Request, res: Response) => {
    try {
      const plantAlerts = await this.plantsService.getPlantAlerts();
      res.json(plantAlerts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  deletePlant = async (req: Request, res: Response) => {
    const { name } = req.params;
    try {
      await this.plantsService.deletePlant(name);
      res.json({ message: "Planta y sus alertas eliminadas con éxito" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
