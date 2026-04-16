import { PrismaService } from '../../common/prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
    }[]>;
}
