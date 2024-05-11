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
        updatedAt: new Date(),
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al registrar al usuario' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passswordHash))) {
      return res.status(401).json({ message: 'Email o contraseña invalida' });
    }
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('La llave secreta de JWT no esta definida');
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Ocurrió un error al intentar iniciar sesión' });
  }
});

app.get('/alerts/:type', async (req, res) => {
  const { type } = req.params;
  const alertType = await prisma.alertType.findUnique({
    where: {
      tipo: type,
    },
  });

  if (!alertType) {
    return res.status(404).json({ error: 'Tipo de alerta no encontrado' });
  }

  const alerts = await prisma.alert.findMany({
    where: {
      alertTypeId: alertType.id,
    },
    include: {
      alertSeverity: true,
    },
  });

  const severityCounts = alerts.reduce((counts: { [key: string]: number }, alert) => {
    if (!counts[alert.alertSeverity.severity]) {
      counts[alert.alertSeverity.severity] = 0;
    }
    counts[alert.alertSeverity.severity]++;
    return counts;
  }, {});

  res.json(severityCounts);
});


app.post('/plants', async (req, res) => {
  const { name, country } = req.body;

  const newPlant = await prisma.plant.create({
      data: {
          name: name,
          country: country,
      },
  });

  res.json(newPlant);
});

app.post('/createAlerts', async (req, res) => {
  const { name, country, alertSeverities } = req.body;

  try {
    const plant = await prisma.plant.findUnique({
      where: {
        name,
      },
    });

    if (!plant) {
      return res.status(400).json({ error: `La planta ${name} no existe` });
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
        return res.status(400).json({ error: `AlertSeverity ${severity} does not exist` });
      }

      for (let i = 0; i < count; i++) {
        const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        await prisma.alert.create({
          data: {
            plantId: plant.id,
            alertTypeId: randomAlertType.id,
            alertSeverityId: alertSeverityRecord.id,
          },
        });
      }
    }

    res.status(200).json({ message: 'Alertas creadas correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Ocurrio un error en la creacion de alertas' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});