import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: string) {
    return this.prisma.scoped.driver.findMany({
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
    return this.prisma.scoped.driver.findFirst({
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
    return this.prisma.scoped.driver.findFirst({
      where: { userId },
    });
  }

  async create(data: any) {
    // TODO: this creates a User with a fake passwordHash — the driver can't
    // actually log in. Fix when we wire up the real driver-onboarding flow.
    const passwordHash = '$2a$12$placeholder';

    const user = await this.prisma.scoped.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'DRIVER',
      } as any,
    });

    return this.prisma.scoped.driver.create({
      data: {
        userId: user.id,
        cdlNumber: data.cdlNumber,
        cdlClass: data.cdlClass,
        cdlExpiry: data.cdlExpiry ? new Date(data.cdlExpiry) : null,
        medicalExpiry: data.medicalExpiry ? new Date(data.medicalExpiry) : null,
      } as any,
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
    const existing = await this.prisma.scoped.driver.findFirst({ where: { id } });
    if (!existing) return null;
    return this.prisma.driver.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async updateLocation(userId: string, lat: number, lng: number, speed: number) {
    const driver = await this.prisma.scoped.driver.findFirst({
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