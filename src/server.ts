import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();



const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Backend de proyecto TechForB by Pablo Camacho</h1>
      </body>
    </html>
  `);
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    const emailRegularExpression = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegularExpression.test(email)) {
      return res.status(400).json({ error: 'El email es invalido' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 dígitos' });
    }
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passswordHash: hashedPassword,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al registrar al usuario' });
  }
});


// Ruta que devuelve un JSON
app.get('/api', (req, res) => {
  res.json({ mensaje: '¡Hola, mundo!' });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passswordHash))) {
      return res.status(401).json({ message: 'Email o contraseña invalida' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "process.env.JWT_SECRET_KEY");
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Ocurrió un error al intentar iniciar sesión' });
  }
});


//Ejemplo de proteccion de endpoints
app.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Falta token de autenticación' });
  }

  try {
    const payload = jwt.verify(token, 'Key Secreta');
    res.json(payload);
  } catch (e) {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});