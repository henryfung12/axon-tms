import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    uploadDocument(file: Express.Multer.File, loadId: string, type: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        driverId: string | null;
        fileName: string;
        s3Key: string;
        s3Url: string | null;
        uploadedAt: Date;
        loadId: string | null;
    }>;
    getDocumentsByLoad(loadId: string): Promise<{
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
