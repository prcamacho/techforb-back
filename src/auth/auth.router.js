"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const router = express_1.default.Router();
exports.authRouter = router;
const authController = new auth_controller_1.AuthController();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/check-token", authController.checkToken);
