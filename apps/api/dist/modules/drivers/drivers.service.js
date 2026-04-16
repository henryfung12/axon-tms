"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DriversService = class DriversService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status) {
        return this.prisma.driver.findMany({
            where: status ? { status: status } : undefined,
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.driver.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                loads: {
                    include: {
                        stops: { orderBy: { sequence: 'asc' } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                hosLogs: {
                    orderBy: { startedAt: 'desc' },
                    take: 20,
                },
            },
        });
    }
    async findByUserId(userId) {
        return this.prisma.driver.findUnique({
            where: { userId },
        });
    }
    async create(data) {
        const passwordHash = '$2a$12$placeholder';
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                role: 'DRIVER',
            },
        });
        return this.prisma.driver.create({
            data: {
                userId: user.id,
                cdlNumber: data.cdlNumber,
                cdlClass: data.cdlClass,
                cdlExpiry: data.cdlExpiry ? new Date(data.cdlExpiry) : null,
                medicalExpiry: data.medicalExpiry ? new Date(data.medicalExpiry) : null,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.driver.update({
            where: { id },
            data: { status: status },
        });
    }
    async updateLocation(userId, lat, lng, speed) {
        const driver = await this.prisma.driver.findUnique({
            where: { userId },
        });
        if (!driver)
            return null;
        return this.prisma.driver.update({
            where: { userId },
            data: {
                currentLat: lat,
                currentLng: lng,
                currentSpeed: speed,
                lastLocationAt: new Date(),
                status: 'DRIVING',
            },
        });
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map