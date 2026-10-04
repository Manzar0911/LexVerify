import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import sanitize from 'sanitize-filename';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentService } from './document.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { EditExtractedFieldDto } from './dto/edit-extracted-field.dto';
import { Document } from './entities/document.entity';
import { ExtractedData } from './entities/extracted-data.entity';

const multerStorage = diskStorage({
  destination: './uploads/temp',
  filename: (_req, file, cb) => {
    const sanitized = sanitize(file.originalname) || 'upload';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(sanitized)}`);
  },
});

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

@ApiTags('Documents')
@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('vendors/:vendorId/documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, PNG, JPG files allowed'), false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: { type: 'string', enum: ['registration_certificate', 'gst_certificate', 'bank_document'] },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a document for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Document uploaded', type: Document })
  async upload(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ): Promise<Document> {
    if (!file) throw new BadRequestException('File is required');
    return this.documentService.create(vendorId, file, dto);
  }

  @Get('vendors/:vendorId/documents')
  @ApiOperation({ summary: 'Get all documents for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of documents', type: [Document] })
  async findAll(@Param('vendorId', ParseUUIDPipe) vendorId: string): Promise<Document[]> {
    return this.documentService.findByVendor(vendorId);
  }

  @Get('vendors/:vendorId/document-checklist')
  @ApiOperation({ summary: 'Get document checklist status for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  async getChecklist(@Param('vendorId', ParseUUIDPipe) vendorId: string) {
    return this.documentService.getDocumentChecklist(vendorId);
  }

  @Get('documents/:id/extracted-data')
  @ApiOperation({ summary: 'Get extracted data for a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Extracted fields', type: [ExtractedData] })
  async getExtractedData(@Param('id', ParseUUIDPipe) id: string): Promise<ExtractedData[]> {
    return this.documentService.getExtractedData(id);
  }

  @Put('extracted-data/:id')
  @ApiOperation({ summary: 'Edit an extracted data field' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Field updated', type: ExtractedData })
  async editField(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditExtractedFieldDto,
  ): Promise<ExtractedData> {
    return this.documentService.editExtractedField(id, dto);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.documentService.remove(id);
  }
}
