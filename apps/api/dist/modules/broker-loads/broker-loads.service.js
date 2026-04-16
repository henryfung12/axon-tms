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
exports.BrokerLoadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let BrokerLoadsService = class BrokerLoadsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(status) {
        return this.prisma.brokerLoad.findMany({
            where: status ? { status: status } : undefined,
            include: {
                customer: { select: { id: true, name: true } },
                carrier: { select: { id: true, name: true, mcNumber: true } },
                stops: { orderBy: { sequence: 'asc' } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.brokerLoad.findUnique({
            where: { id },
            include: {
                customer: true,
                carrier: true,
                stops: { orderBy: { sequence: 'asc' } },
                datPostings: { orderBy: { postedAt: 'desc' } },
            },
        });
    }
    async create(data) {
        const count = await this.prisma.brokerLoad.count();
        const loadNumber = `GB-${String(10001 + count).padStart(5, '0')}`;
        return this.prisma.brokerLoad.create({
            data: {
                loadNumber,
                customerId: data.customerId,
                carrierId: data.carrierId || null,
                commodity: data.commodity,
                weight: data.weight,
                pieces: data.pieces,
                shipperRate: data.shipperRate,
                carrierRate: data.carrierRate || null,
                margin: data.carrierRate ? data.shipperRate - data.carrierRate : null,
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
    async assignCarrier(id, carrierId, carrierRate) {
        const load = await this.prisma.brokerLoad.findUnique({ where: { id } });
        return this.prisma.brokerLoad.update({
            where: { id },
            data: {
                carrierId,
                carrierRate,
                margin: load ? load.shipperRate - carrierRate : null,
                status: 'CARRIER_ASSIGNED',
            },
            include: {
                customer: { select: { id: true, name: true } },
                carrier: { select: { id: true, name: true, mcNumber: true } },
                stops: true,
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.brokerLoad.update({
            where: { id },
            data: { status: status },
        });
    }
};
exports.BrokerLoadsService = BrokerLoadsService;
exports.BrokerLoadsService = BrokerLoadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BrokerLoadsService);
//# sourceMappingURL=broker-loads.service.js.map