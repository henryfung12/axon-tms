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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerLoadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const broker_loads_service_1 = require("./broker-loads.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let BrokerLoadsController = class BrokerLoadsController {
    constructor(brokerLoadsService) {
        this.brokerLoadsService = brokerLoadsService;
    }
    findAll(status) {
        return this.brokerLoadsService.findAll(status);
    }
    findOne(id) {
        return this.brokerLoadsService.findOne(id);
    }
    create(body) {
        return this.brokerLoadsService.create(body);
    }
    assignCarrier(id, carrierId, carrierRate) {
        return this.brokerLoadsService.assignCarrier(id, carrierId, carrierRate);
    }
    updateStatus(id, status) {
        return this.brokerLoadsService.updateStatus(id, status);
    }
};
exports.BrokerLoadsController = BrokerLoadsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrokerLoadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BrokerLoadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BrokerLoadsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/assign-carrier'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('carrierId')),
    __param(2, (0, common_1.Body)('carrierRate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", void 0)
], BrokerLoadsController.prototype, "assignCarrier", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BrokerLoadsController.prototype, "updateStatus", null);
exports.BrokerLoadsController = BrokerLoadsController = __decorate([
    (0, swagger_1.ApiTags)('Broker Loads'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('broker-loads'),
    __metadata("design:paramtypes", [broker_loads_service_1.BrokerLoadsService])
], BrokerLoadsController);
//# sourceMappingURL=broker-loads.controller.js.map