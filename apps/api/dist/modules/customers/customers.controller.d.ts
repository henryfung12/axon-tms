import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
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
    create(body: any): Promise<{
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
