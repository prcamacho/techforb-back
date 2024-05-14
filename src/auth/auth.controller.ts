import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await this.authService.register(email, password);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const token = await this.authService.login(email, password);
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  checkToken = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó el token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const user = await this.authService.checkToken(token);
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}