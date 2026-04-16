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
exports.CarriersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CarriersService = class CarriersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status) {
        return this.prisma.externalCarrier.findMany({
            where: status ? { status: status } : undefined,
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.externalCarrier.findUnique({
            where: { id },
            include: {
                brokerLoads: {
                    include: {
                        customer: { select: { id: true, name: true } },
                        stops: { orderBy: { sequence: 'asc' } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
    }
    async create(data) {
        return this.prisma.externalCarrier.create({
            data: {
                name: data.name,
                mcNumber: data.mcNumber,
                dotNumber: data.dotNumber,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                zip: data.zip,
                paymentTerms: data.paymentTerms || 30,
                preferredLanes: data.preferredLanes,
                notes: data.notes,
                insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : null,
                authorityExpiry: data.authorityExpiry ? new Date(data.authorityExpiry) : null,
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.externalCarrier.update({
            where: { id },
            data: { status: status },
        });
    }
    async markRmisVerified(id) {
        return this.prisma.externalCarrier.update({
            where: { id },
            data: {
                rmisVerifiedAt: new Date(),
                status: 'ACTIVE',
            },
        });
    }
};
exports.CarriersService = CarriersService;
exports.CarriersService = CarriersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CarriersService);
//# sourceMappingURL=carriers.service.js.map