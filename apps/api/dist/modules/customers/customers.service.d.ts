import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
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
    }[]>;
    create(data: any): Promise<{
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
    }>;
}
