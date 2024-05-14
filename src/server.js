"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)(), express_1.default.json());
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
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingUser = yield prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        const emailRegularExpression = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
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
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                passswordHash: hashedPassword,
                updatedAt: new Date(),
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Ocurrió un error al registrar al usuario" });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !(yield bcrypt_1.default.compare(password, user.passswordHash))) {
            return res.status(401).json({ message: "Email o contraseña invalida" });
        }
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("La llave secreta de JWT no esta definida");
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Ocurrió un error al intentar iniciar sesión" });
    }
}));
app.get('/auth/check-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No se proporcionó el token' });
        }
        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error('La llave secreta de JWT no está definida');
        }
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({ message: 'Token inválido' });
            }
            if (!decoded || typeof decoded !== 'object') {
                return res.status(401).json({ message: 'Token inválido' });
            }
            const user = yield prisma.user.findUnique({ where: { id: decoded.id } });
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
        }));
    }
    catch (error) {
        res.status(500).json({ message: 'Ocurrió un error al verificar el token' });
    }
}));
app.get("/alerts/:type", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.params;
    const alertType = yield prisma.alertType.findUnique({
        where: {
            tipo: type,
        },
    });
    if (!alertType) {
        return res.status(404).json({ error: "Tipo de alerta no encontrado" });
    }
    const alerts = yield prisma.alert.findMany({
        where: {
            alertTypeId: alertType.id,
        },
        include: {
            alertSeverity: true,
        },
    });
    const severityCounts = alerts.reduce((counts, alert) => {
        if (!counts[alert.alertSeverity.severity]) {
            counts[alert.alertSeverity.severity] = 0;
        }
        counts[alert.alertSeverity.severity]++;
        return counts;
    }, {});
    res.json(severityCounts);
}));
app.post("/plants", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, country } = req.body;
    const existingPlant = yield prisma.plant.findUnique({
        where: {
            name: name,
        },
    });
    if (existingPlant) {
        return res.status(400).json({ error: `La planta ${name} ya existe` });
    }
    const newPlant = yield prisma.plant.create({
        data: {
            name: name,
            country: country,
        },
    });
    res.json(newPlant);
}));
app.post("/createAlerts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, country, alertSeverities } = req.body;
    try {
        const plant = yield prisma.plant.findUnique({
            where: {
                name,
            },
        });
        if (!plant) {
            return res.status(400).json({ error: `La planta ${name} no existe` });
        }
        const alertTypes = yield prisma.alertType.findMany();
        yield prisma.alert.deleteMany({
            where: {
                plantId: plant.id,
            },
        });
        for (let alertSeverity of alertSeverities) {
            const { severity, count } = alertSeverity;
            const alertSeverityRecord = yield prisma.alertSeverity.findUnique({
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
                const randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
                yield prisma.alert.create({
                    data: {
                        plantId: plant.id,
                        alertTypeId: randomAlertType.id,
                        alertSeverityId: alertSeverityRecord.id,
                    },
                });
            }
        }
        res.status(200).json({ message: "Alertas creadas correctamente" });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: "Ocurrio un error en la creacion de alertas" });
    }
}));
app.get("/alerts/severity/:severity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { severity } = req.params;
    const alertSeverity = yield prisma.alertSeverity.findUnique({
        where: {
            severity: severity,
        },
    });
    if (!alertSeverity) {
        return res.status(404).json({ error: "Severidad de alerta no encontrada" });
    }
    const alerts = yield prisma.alert.findMany({
        where: {
            alertSeverityId: alertSeverity.id,
        },
    });
    res.json({ count: alerts.length });
}));
app.get("/plants/alerts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plants = yield prisma.plant.findMany({
            include: {
                alerts: {
                    include: {
                        alertSeverity: true,
                    },
                },
            },
        });
        const plantAlerts = plants.map((plant) => {
            const severityCounts = plant.alerts.reduce((counts, alert) => {
                if (!counts[alert.alertSeverity.severity]) {
                    counts[alert.alertSeverity.severity] = 0;
                }
                counts[alert.alertSeverity.severity]++;
                return counts;
            }, {});
            return {
                name: plant.name,
                country: plant.country,
                totalAlerts: plant.alerts.length,
                severityCounts,
            };
        });
        res.json(plantAlerts);
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while fetching alerts" });
    }
}));
app.delete("/plants/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    const plant = yield prisma.plant.findUnique({
        where: {
            name,
        },
    });
    if (!plant) {
        return res.status(404).json({ error: "Planta no encontrada" });
    }
    yield prisma.alert.deleteMany({
        where: {
            plantId: plant.id,
        },
    });
    yield prisma.plant.delete({
        where: {
            id: plant.id,
        },
    });
    res.json({ message: "Planta y sus alertas eliminadas con éxito" });
}));
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
