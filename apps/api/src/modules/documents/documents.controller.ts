import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('loadId') loadId: string,
    @Body('type') type: string,
  ) {
    return this.documentsService.uploadDocument(file, loadId, type);
  }

  @Get('load/:loadId')
  getByLoad(@Param('loadId') loadId: string) {
    return this.documentsService.getDocumentsByLoad(loadId);
  }
}