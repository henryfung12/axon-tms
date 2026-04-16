import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DriversService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(status?: string): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    })[]>;
    findOne(id: string): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
        loads: ({
            stops: {
                id: string;
                createdAt: Date;
                type: import("@prisma/client").$Enums.StopType;
                notes: string | null;
                address: string;
                city: string;
                state: string;
                zip: string;
                sequence: number;
                facilityName: string;
                lat: number | null;
                lng: number | null;
                scheduledAt: Date | null;
                arrivedAt: Date | null;
                completedAt: Date | null;
                loadId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            loadNumber: string;
            customerId: string;
            driverId: string | null;
            status: import("@prisma/client").$Enums.LoadStatus;
            commodity: string | null;
            weight: number | null;
            pieces: number | null;
            temperature: number | null;
            rate: number;
            fuelSurcharge: number;
            detention: number;
            totalRate: number;
            notes: string | null;
        })[];
        hosLogs: {
            id: string;
            createdAt: Date;
            driverId: string;
            status: import("@prisma/client").$Enums.DriverStatus;
            notes: string | null;
            startedAt: Date;
            endedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    }) | null>;
    findByUserId(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    } | null>;
    create(data: any): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    }>;
    updateLocation(userId: string, lat: number, lng: number, speed: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.DriverStatus;
        cdlNumber: string | null;
        cdlClass: string | null;
        cdlExpiry: Date | null;
        medicalExpiry: Date | null;
        currentLat: number | null;
        currentLng: number | null;
        currentSpeed: number | null;
        lastLocationAt: Date | null;
        hosHoursUsed: number;
        hosCycleResetAt: Date | null;
    } | null>;
}
