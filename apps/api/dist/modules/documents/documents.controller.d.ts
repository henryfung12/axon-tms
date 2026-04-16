import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(file: Express.Multer.File, loadId: string, type: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        driverId: string | null;
        fileName: string;
        s3Key: string;
        s3Url: string | null;
        uploadedAt: Date;
        loadId: string | null;
    }>;
    getByLoad(loadId: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        driverId: string | null;
        fileName: string;
        s3Key: string;
        s3Url: string | null;
        uploadedAt: Date;
        loadId: string | null;
    }[]>;
}
