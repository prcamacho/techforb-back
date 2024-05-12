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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var dotenv = require("dotenv");
dotenv.config();
var prisma = new client_1.PrismaClient();
var app = (0, express_1.default)();
var port = 3000;
app.use(express_1.default.json());
app.get('/', function (req, res) {
    res.send("\n    <html>\n      <body>\n        <h1>Backend de proyecto TechForB by Pablo Camacho</h1>\n        <ul>\n        <li>Usar Body - raw - json en Postman</li>\n        \n        <br><strong>Registrarse</strong>\n        <li>email , password Post: https://techforb-back.pablocamacho.com.ar/register</li>\n        <br><strong>Loguearse</strong>\n        <li>email , password Post: https://techforb-back.pablocamacho.com.ar/login</li>\n        <br><strong>Obtener alertas por tipo \"niveles\" , \"viento\", etc</strong> \n        <li>Get: https://techforb-back.pablocamacho.com.ar/alerts/tension </li>\n        <br><strong>Cargar Planta con nombre y pais</strong>\n        <li>name, country Post: https://techforb-back.pablocamacho.com.ar/plants</li>\n        <br><strong>Editar una planta para agregarle severidades de alertas</strong>\n        <li>\"name\": \"Nombre de la planta\",\n        \"country\": \"Pa\u00EDs de la planta\",\n        \"alertSeverities\": [\n          {\n            \"severity\": \"Puede ser ok, media, roja\",\n            \"count\": \"Cantidad de alertas de esta severidad\"\n          },\n          ... Se puede mandar de las 3 severidades al mismo tiempo\n        ]\n      } Post: https://techforb-back.pablocamacho.com.ar/createAlerts</li>\n      <br><strong>Obetener alertas por severidad</strong>\n      <li>\"ok\" , \"media\" , \"roja\" Get: https://techforb-back.pablocamacho.com.ar/alerts/severity/:severity</li>\n      <br><strong>Obtener el total de alertas y cantidad de cada severidad por planta</strong>\n      <li>Para armar la tablota de severity por planta Get: https://techforb-back.pablocamacho.com.ar/plants/alerts</li>\n      <br><strong>Borra alertas y planta de la BD</strong>\n      <li>Para Borrar Delete: https://techforb-back.pablocamacho.com.ar/plants/:name</li>\n      <br><strong>Pendiente</strong>\n      <li>No borrar de la BD solo desactivar, agregar nombre al registrarse</li>\n        \n      </ul>\n      </body>\n    </html>\n  ");
});
app.post('/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, existingUser, emailRegularExpression, hashedPassword, user, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, prisma.user.findUnique({
                        where: {
                            email: email,
                        },
                    })];
            case 1:
                existingUser = _b.sent();
                emailRegularExpression = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
                if (!emailRegularExpression.test(email)) {
                    return [2 /*return*/, res.status(400).json({ error: 'El email es invalido' })];
                }
                if (password.length < 8) {
                    return [2 /*return*/, res.status(400).json({ error: 'La contraseña debe tener al menos 8 dígitos' })];
                }
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ error: 'El correo electrónico ya está registrado' })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                return [4 /*yield*/, prisma.user.create({
                        data: {
                            email: email,
                            passswordHash: hashedPassword,
                            updatedAt: new Date(),
                        },
                    })];
            case 3:
                user = _b.sent();
                res.json(user);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                res.status(500).json({ error: 'Ocurrió un error al registrar al usuario' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, _b, token, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
            case 1:
                user = _c.sent();
                _b = !user;
                if (_b) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.passswordHash)];
            case 2:
                _b = !(_c.sent());
                _c.label = 3;
            case 3:
                if (_b) {
                    return [2 /*return*/, res.status(401).json({ message: 'Email o contraseña invalida' })];
                }
                if (!process.env.JWT_SECRET_KEY) {
                    throw new Error('La llave secreta de JWT no esta definida');
                }
                token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY);
                res.json({ token: token });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _c.sent();
                res.status(500).json({ message: 'Ocurrió un error al intentar iniciar sesión' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.get('/alerts/:type', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, alertType, alerts, severityCounts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                type = req.params.type;
                return [4 /*yield*/, prisma.alertType.findUnique({
                        where: {
                            tipo: type,
                        },
                    })];
            case 1:
                alertType = _a.sent();
                if (!alertType) {
                    return [2 /*return*/, res.status(404).json({ error: 'Tipo de alerta no encontrado' })];
                }
                return [4 /*yield*/, prisma.alert.findMany({
                        where: {
                            alertTypeId: alertType.id,
                        },
                        include: {
                            alertSeverity: true,
                        },
                    })];
            case 2:
                alerts = _a.sent();
                severityCounts = alerts.reduce(function (counts, alert) {
                    if (!counts[alert.alertSeverity.severity]) {
                        counts[alert.alertSeverity.severity] = 0;
                    }
                    counts[alert.alertSeverity.severity]++;
                    return counts;
                }, {});
                res.json(severityCounts);
                return [2 /*return*/];
        }
    });
}); });
app.post('/plants', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, country, newPlant;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, country = _a.country;
                return [4 /*yield*/, prisma.plant.create({
                        data: {
                            name: name,
                            country: country,
                        },
                    })];
            case 1:
                newPlant = _b.sent();
                res.json(newPlant);
                return [2 /*return*/];
        }
    });
}); });
app.post('/createAlerts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, name, country, alertSeverities, plant, alertTypes, _i, alertSeverities_1, alertSeverity, severity, count, alertSeverityRecord, i, randomAlertType, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, name = _a.name, country = _a.country, alertSeverities = _a.alertSeverities;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 12, , 13]);
                return [4 /*yield*/, prisma.plant.findUnique({
                        where: {
                            name: name,
                        },
                    })];
            case 2:
                plant = _b.sent();
                if (!plant) {
                    return [2 /*return*/, res.status(400).json({ error: "La planta ".concat(name, " no existe") })];
                }
                return [4 /*yield*/, prisma.alertType.findMany()];
            case 3:
                alertTypes = _b.sent();
                return [4 /*yield*/, prisma.alert.deleteMany({
                        where: {
                            plantId: plant.id,
                        },
                    })];
            case 4:
                _b.sent();
                _i = 0, alertSeverities_1 = alertSeverities;
                _b.label = 5;
            case 5:
                if (!(_i < alertSeverities_1.length)) return [3 /*break*/, 11];
                alertSeverity = alertSeverities_1[_i];
                severity = alertSeverity.severity, count = alertSeverity.count;
                return [4 /*yield*/, prisma.alertSeverity.findUnique({
                        where: {
                            severity: severity,
                        },
                    })];
            case 6:
                alertSeverityRecord = _b.sent();
                if (!alertSeverityRecord) {
                    return [2 /*return*/, res.status(400).json({ error: "AlertSeverity ".concat(severity, " does not exist") })];
                }
                i = 0;
                _b.label = 7;
            case 7:
                if (!(i < count)) return [3 /*break*/, 10];
                randomAlertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
                return [4 /*yield*/, prisma.alert.create({
                        data: {
                            plantId: plant.id,
                            alertTypeId: randomAlertType.id,
                            alertSeverityId: alertSeverityRecord.id,
                        },
                    })];
            case 8:
                _b.sent();
                _b.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 7];
            case 10:
                _i++;
                return [3 /*break*/, 5];
            case 11:
                res.status(200).json({ message: 'Alertas creadas correctamente' });
                return [3 /*break*/, 13];
            case 12:
                error_3 = _b.sent();
                res.status(500).json({ error: 'Ocurrio un error en la creacion de alertas' });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
app.get('/alerts/severity/:severity', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var severity, alertSeverity, alerts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                severity = req.params.severity;
                return [4 /*yield*/, prisma.alertSeverity.findUnique({
                        where: {
                            severity: severity,
                        },
                    })];
            case 1:
                alertSeverity = _a.sent();
                if (!alertSeverity) {
                    return [2 /*return*/, res.status(404).json({ error: 'Severidad de alerta no encontrada' })];
                }
                return [4 /*yield*/, prisma.alert.findMany({
                        where: {
                            alertSeverityId: alertSeverity.id,
                        },
                    })];
            case 2:
                alerts = _a.sent();
                res.json({ count: alerts.length });
                return [2 /*return*/];
        }
    });
}); });
app.get('/plants/alerts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var plants, plantAlerts, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.plant.findMany({
                        include: {
                            alerts: {
                                include: {
                                    alertSeverity: true,
                                },
                            },
                        },
                    })];
            case 1:
                plants = _a.sent();
                plantAlerts = plants.map(function (plant) {
                    var severityCounts = plant.alerts.reduce(function (counts, alert) {
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
                        severityCounts: severityCounts,
                    };
                });
                res.json(plantAlerts);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({ error: 'An error occurred while fetching alerts' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete('/plants/:name', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name, plant;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                name = req.params.name;
                return [4 /*yield*/, prisma.plant.findUnique({
                        where: {
                            name: name,
                        },
                    })];
            case 1:
                plant = _a.sent();
                if (!plant) {
                    return [2 /*return*/, res.status(404).json({ error: 'Planta no encontrada' })];
                }
                return [4 /*yield*/, prisma.alert.deleteMany({
                        where: {
                            plantId: plant.id,
                        },
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma.plant.delete({
                        where: {
                            id: plant.id,
                        },
                    })];
            case 3:
                _a.sent();
                res.json({ message: 'Planta y sus alertas eliminadas con éxito' });
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Servidor corriendo en http://localhost:".concat(port));
});
