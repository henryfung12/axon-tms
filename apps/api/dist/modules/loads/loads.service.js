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
exports.LoadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let LoadsService = class LoadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status) {
        return this.prisma.load.findMany({
            where: status ? { status: status } : undefined,
            include: {
                customer: { select: { id: true, name: true } },
                driver: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
                stops: { orderBy: { sequence: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.load.findUnique({
            where: { id },
            include: {
                customer: true,
                driver: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
                stops: { orderBy: { sequence: 'asc' } },
                documents: true,
                invoice: true,
            },
        });
    }
    async create(data) {
        const count = await this.prisma.load.count();
        const loadNumber = `GE-${String(10001 + count).padStart(5, '0')}`;
        return this.prisma.load.create({
            data: {
                loadNumber,
                customerId: data.customerId,
                driverId: data.driverId || null,
                commodity: data.commodity,
                weight: data.weight,
                pieces: data.pieces,
                rate: data.rate,
                fuelSurcharge: data.fuelSurcharge || 0,
                detention: data.detention || 0,
                totalRate: data.rate + (data.fuelSurcharge || 0) + (data.detention || 0),
                notes: data.notes,
                stops: {
                    create: data.stops?.map((stop, index) => ({
                        type: stop.type,
                        sequence: index + 1,
                        facilityName: stop.facilityName,
                        address: stop.address,
                        city: stop.city,
                        state: stop.state,
                        zip: stop.zip,
                        scheduledAt: stop.scheduledAt ? new Date(stop.scheduledAt).toISOString() : null,
                    })),
                },
            },
            include: {
                customer: { select: { id: true, name: true } },
                stops: true,
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.load.update({
            where: { id },
            data: { status: status },
        });
    }
    async assignDriver(id, driverId) {
        return this.prisma.load.update({
            where: { id },
            data: {
                driverId,
                status: 'ASSIGNED',
            },
            include: {
                customer: { select: { id: true, name: true } },
                driver: {
                    include: {
                        user: { select: { firstName: true, lastName: true } },
                    },
                },
                stops: true,
            },
        });
    }
};
exports.LoadsService = LoadsService;
exports.LoadsService = LoadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoadsService);
//# sourceMappingURL=loads.service.js.map