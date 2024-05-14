import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export class AuthService {
  register = async (email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    const emailRegularExpression =
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegularExpression.test(email)) {
      throw new Error("El email es invalido");
    }
    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 dígitos");
    }
    if (existingUser) {
      throw new Error("El correo electrónico ya está registrado");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passswordHash: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return user;
  };

  login = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passswordHash))) {
      throw new Error("Email o contraseña invalida");
    }
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("La llave secreta de JWT no esta definida");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY
    );
    return token;
  };

  checkToken = async (token: string) => {
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('La llave secreta de JWT no está definida');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      throw new Error('Token inválido');
    }

    if (!decoded || typeof decoded !== 'object') {
      throw new Error('Token inválido');
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  };
}
