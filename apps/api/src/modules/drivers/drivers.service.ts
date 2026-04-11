import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.driver.findMany({
      where: status ? { status: status as any } : undefined,
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

  async findOne(id: string) {
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

  async findByUserId(userId: string) {
    return this.prisma.driver.findUnique({
      where: { userId },
    });
  }

  async create(data: any) {
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

  async updateStatus(id: string, status: string) {
    return this.prisma.driver.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number, speed: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) return null;

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
}