import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
        };
        accessToken: string;
    }>;
    refresh(req: Request): Promise<{
        accessToken: Promise<string>;
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    getMe(user: {
        sub: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        phone: string | null;
    }>;
    register(dto: LoginDto & {
        firstName: string;
        lastName: string;
        role?: string;
    }): Promise<{
        id: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        firstName: string;
        lastName: string;
    }>;
}
