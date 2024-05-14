import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(cors(),express.json());

app.get("/", (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Backend de proyecto TechForB by Pablo Camacho</h1>
        <ul>
        <li>Usar Body - raw - json en Postman</li>
        
        <br><strong>Registrarse</strong>
        <li>email , password Post: https://techforb-back.pablocamacho.com.ar/register</li>
        <br><strong>Loguearse</strong>
        <li>email , password Post: https://techforb-back.pablocamacho.com.ar/login</li>
        <br><strong>Obtener alertas por tipo "niveles" , "viento", etc</strong> 
        <li>Get: https://techforb-back.pablocamacho.com.ar/alerts/tension </li>
        <br><strong>Cargar Planta con nombre y pais</strong>
        <li>name, country Post: https://techforb-back.pablocamacho.com.ar/plants</li>
        <br><strong>Editar una planta para agregarle severidades de alertas</strong>
        <li>"name": "Nombre de la planta",
        "country": "País de la planta",
        "alertSeverities": [
          {
            "severity": "Puede ser ok, media, roja",
            "count": "Cantidad de alertas de esta severidad"
          },
          ... Se puede mandar de las 3 severidades al mismo tiempo
        ]
      } Post: https://techforb-back.pablocamacho.com.ar/createAlerts</li>
      <br><strong>Obetener alertas por severidad</strong>
      <li>"ok" , "media" , "roja" Get: https://techforb-back.pablocamacho.com.ar/alerts/severity/:severity</li>
      <br><strong>Obtener el total de alertas y cantidad de cada severidad por planta</strong>
      <li>Para armar la tablota de severity por planta Get: https://techforb-back.pablocamacho.com.ar/plants/alerts</li>
      <br><strong>Borra alertas y planta de la BD</strong>
      <li>Para Borrar Delete: https://techforb-back.pablocamacho.com.ar/plants/:name</li>
      <br><strong>Pendiente</strong>
      <li>No borrar de la BD solo desactivar, agregar nombre al registrarse</li>
        
      </ul>
      </body>
    </html>
  `);
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    const emailRegularExpression =
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegularExpression.test(email)) {
      return res.status(400).json({ error: "El email es invalido" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 dígitos" });
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "El correo electrónico ya está registrado" });
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
    res.status(500).json({ error: "Ocurrió un error al registrar al usuario" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passswordHash))) {
      return res.status(401).json({ message: "Email o contraseña invalida" });
    }
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error("La llave secreta de JWT no esta definida");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET_KEY
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ocurrió un error al intentar iniciar sesión" });
  }
});

app.get('/auth/check-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó el token' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET_KEY) {
      throw new Error('La llave secreta de JWT no está definida');
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      if (!decoded || typeof decoded !== 'object') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Ocurrió un error al verificar el token' });
  }
});

app.get("/alerts/:type", async (req, res) => {
  const { type } = req.params;
  const alertType = await prisma.alertType.findUnique({
    where: {
      tipo: type,
    },
  });

  if (!alertType) {
    return res.status(404).json({ error: "Tipo de alerta no encontrado" });
  }

  const alerts = await prisma.alert.findMany({
    where: {
      alertTypeId: alertType.id,
    },
    include: {
      alertSeverity: true,
    },
  });

  const severityCounts = alerts.reduce(
    (counts: { [key: string]: number }, alert) => {
      if (!counts[alert.alertSeverity.severity]) {
        counts[alert.alertSeverity.severity] = 0;
      }
      counts[alert.alertSeverity.severity]++;
      return counts;
    },
    {}
  );

  res.json(severityCounts);
});

app.post("/plants", async (req, res) => {
  const { name, country } = req.body;

  const existingPlant = await prisma.plant.findUnique({
    where: {
      name: name,
    },
  });

  if (existingPlant) {
    return res.status(400).json({ error: `La planta ${name} ya existe` });
  }

  const newPlant = await prisma.plant.create({
    data: {
      name: name,
      country: country,
    },
  });

  res.json(newPlant);
});


app.post("/createAlerts", async (req, res) => {
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
        return res
          .status(400)
          .json({ error: `AlertSeverity ${severity} does not exist` });
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

    res.status(200).json({ message: "Alertas creadas correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrio un error en la creacion de alertas" });
  }
});

app.get("/alerts/severity/:severity", async (req, res) => {
  const { severity } = req.params;

  const alertSeverity = await prisma.alertSeverity.findUnique({
    where: {
      severity: severity,
    },
  });

  if (!alertSeverity) {
    return res.status(404).json({ error: "Severidad de alerta no encontrada" });
  }

  const alerts = await prisma.alert.findMany({
    where: {
      alertSeverityId: alertSeverity.id,
    },
  });

  res.json({ count: alerts.length });
});

app.get("/plants/alerts", async (req, res) => {
  try {
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

    res.json(plantAlerts);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching alerts" });
  }
});

app.delete("/plants/:name", async (req, res) => {
  const { name } = req.params;

  const plant = await prisma.plant.findUnique({
    where: {
      name,
    },
  });

  if (!plant) {
    return res.status(404).json({ error: "Planta no encontrada" });
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

  res.json({ message: "Planta y sus alertas eliminadas con éxito" });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
