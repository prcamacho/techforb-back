import express from "express";
import { AuthController } from "./auth.controller";

const router = express.Router();
const authController = new AuthController();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/check-token", authController.checkToken);

export { router as authRouter };