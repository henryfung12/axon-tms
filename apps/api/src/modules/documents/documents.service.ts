import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadDocument(
    file: Express.Multer.File,
    loadId: string,
    type: string,
  ) {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.document.create({
      data: {
        type: type as any,
        fileName: file.originalname,
        s3Key: fileName,
        s3Url: `/uploads/${fileName}`,
        loadId,
      },
    });
  }

  async getDocumentsByLoad(loadId: string) {
    return this.prisma.document.findMany({
      where: { loadId },
      orderBy: { uploadedAt: 'desc' },
    });
  }
}