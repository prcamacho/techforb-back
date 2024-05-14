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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthService {
    constructor() {
        this.register = (email, password) => __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            const emailRegularExpression = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
            if (!emailRegularExpression.test(email)) {
                throw new Error("El email es invalido");
            }
            if (password.length < 8) {
                throw new Error("La contraseña debe tener al menos 8 dígitos");
            }
            if (existingUser) {
                throw new Error("El correo electrónico ya está registrado");
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield prisma.user.create({
                data: {
                    email,
                    passswordHash: hashedPassword,
                    updatedAt: new Date(),
                },
            });
            return user;
        });
        this.login = (email, password) => __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user || !(yield bcrypt_1.default.compare(password, user.passswordHash))) {
                throw new Error("Email o contraseña invalida");
            }
            if (!process.env.JWT_SECRET_KEY) {
                throw new Error("La llave secreta de JWT no esta definida");
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY);
            return token;
        });
        this.checkToken = (token) => __awaiter(this, void 0, void 0, function* () {
            if (!process.env.JWT_SECRET_KEY) {
                throw new Error('La llave secreta de JWT no está definida');
            }
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
            }
            catch (err) {
                throw new Error('Token inválido');
            }
            if (!decoded || typeof decoded !== 'object') {
                throw new Error('Token inválido');
            }
            const user = yield prisma.user.findUnique({ where: { id: decoded.id } });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            return user;
        });
    }
}
exports.AuthService = AuthService;
