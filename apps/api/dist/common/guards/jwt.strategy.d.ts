import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly usersService;
    constructor(config: ConfigService, usersService: UsersService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        sub: string;
        email: string;
        role: string;
    }>;
}
export {};
