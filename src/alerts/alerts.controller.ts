import { Request, Response } from "express";
import { AlertsService } from "./alerts.service";

export class AlertsController {
  private alertsService = new AlertsService();

  getAlertsByType = async (req: Request, res: Response) => {
    const { type } = req.params;
    try {
      const severityCounts = await this.alertsService.getAlertsByType(type);
      res.json(severityCounts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAlertsBySeverity = async (req: Request, res: Response) => {
    const { severity } = req.params;
    try {
      const count = await this.alertsService.getAlertsBySeverity(severity);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
