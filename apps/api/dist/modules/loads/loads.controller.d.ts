import { LoadsService } from './loads.service';
export declare class LoadsController {
    private readonly loadsService;
    constructor(loadsService: LoadsService);
    findAll(status?: string): Promise<({
        driver: ({
            user: {
                firstName: string;
                lastName: string;
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
        }) | null;
        customer: {
            id: string;
            name: string;
        };
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
    })[]>;
    findOne(id: string): Promise<({
        driver: ({
            user: {
                firstName: string;
                lastName: string;
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
        }) | null;
        customer: {
            id: string;
            email: string | null;
            phone: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            address: string | null;
            city: string | null;
            state: string | null;
            zip: string | null;
            mcNumber: string | null;
            dotNumber: string | null;
            creditLimit: number | null;
            paymentTerms: number;
        };
        invoice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerId: string;
            status: import("@prisma/client").$Enums.InvoiceStatus;
            notes: string | null;
            loadId: string;
            invoiceNumber: string;
            subtotal: number;
            tax: number;
            total: number;
            dueDate: Date;
            paidAt: Date | null;
            factoredAt: Date | null;
        } | null;
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
        documents: {
            id: string;
            type: import("@prisma/client").$Enums.DocumentType;
            driverId: string | null;
            fileName: string;
            s3Key: string;
            s3Url: string | null;
            uploadedAt: Date;
            loadId: string | null;
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
    }) | null>;
    create(body: any): Promise<{
        customer: {
            id: string;
            name: string;
        };
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
    }>;
    updateStatus(id: string, status: string): Promise<{
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
    }>;
    assignDriver(id: string, driverId: string): Promise<{
        driver: ({
            user: {
                firstName: string;
                lastName: string;
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
        }) | null;
        customer: {
            id: string;
            name: string;
        };
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
    }>;
}
