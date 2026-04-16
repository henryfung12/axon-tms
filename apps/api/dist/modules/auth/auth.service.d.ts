import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly prisma;
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    constructor(prisma: PrismaService, usersService: UsersService, jwtService: JwtService, config: ConfigService);
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: Promise<string>;
    }>;
    logout(refreshToken: string): Promise<void>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
    }>;
    createUser(email: string, password: string, firstName: string, lastName: string, role?: string): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
    private generateTokens;
    private generateAccessToken;
    private saveRefreshToken;
}
