import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { Document } from './entities/document.entity';
import { ExtractedData } from './entities/extracted-data.entity';
import { DocumentType, DocumentStatus, ExtractionStatus } from './entities/document.enums';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { EditExtractedFieldDto } from './dto/edit-extracted-field.dto';
import { AiService } from '../ai/ai.service';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(ExtractedData)
    private readonly extractedDataRepository: Repository<ExtractedData>,
    @Inject(forwardRef(() => AiService))
    private readonly aiService: AiService,
  ) {}

  validateFile(file: Express.Multer.File): void {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only PDF, PNG, JPG allowed.',
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit.');
    }
  }

  async create(
    vendorId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ): Promise<Document> {
    this.validateFile(file);
    try {
      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'uploads', 'vendors', vendorId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Move file to vendor-specific directory
      const destPath = path.join(uploadDir, file.filename);
      fs.renameSync(file.path, destPath);

      const document = this.documentRepository.create({
        vendorId,
        documentType: dto.documentType,
        fileName: file.originalname,
        filePath: destPath,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: DocumentStatus.AVAILABLE,
        extractionStatus: ExtractionStatus.PENDING,
      });
      const savedDoc = await this.documentRepository.save(document);

      // Immediately trigger AI extraction
      try {
        console.log(`[DocumentService] Automatically triggering AI extraction for uploaded document: ${savedDoc.id}`);
        await this.aiService.extractDocument(savedDoc.id);
        return await this.findById(savedDoc.id);
      } catch (extractErr) {
        console.warn(`[DocumentService] Async extraction warning for document ${savedDoc.id}:`, extractErr);
        return savedDoc;
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to save document');
    }
  }

  async findByVendor(vendorId: string): Promise<Document[]> {
    const docs = await this.documentRepository.find({
      where: { vendorId },
      order: { uploadedAt: 'DESC' },
    });

    // Auto-resolve any pending documents in background
    for (const doc of docs) {
      if (doc.extractionStatus === ExtractionStatus.PENDING) {
        this.aiService.extractDocument(doc.id).catch((err) => {
          console.warn(`[DocumentService] Background extraction on load for ${doc.id}:`, err);
        });
      }
    }

    return docs;
  }

  async findById(id: string): Promise<Document> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException(`Document "${id}" not found`);
    return doc;
  }

  async getExtractedData(documentId: string): Promise<ExtractedData[]> {
    return this.extractedDataRepository.find({
      where: { documentId },
      order: { fieldName: 'ASC' },
    });
  }

  async saveExtractedData(
    documentId: string,
    fields: Array<{ fieldName: string; extractedValue: string | null; confidenceScore?: number }>,
  ): Promise<void> {
    try {
      // Remove old extracted data for this document
      await this.extractedDataRepository.delete({ documentId });

      const records = fields.map((f) =>
        this.extractedDataRepository.create({
          documentId,
          fieldName: f.fieldName,
          extractedValue: f.extractedValue,
          confidenceScore: f.confidenceScore,
          isEdited: false,
        }),
      );
      await this.extractedDataRepository.save(records);

      // Update document extraction status
      await this.documentRepository.update(documentId, {
        extractionStatus: ExtractionStatus.COMPLETED,
        status: DocumentStatus.VERIFIED,
      });
    } catch (error) {
      await this.documentRepository.update(documentId, {
        extractionStatus: ExtractionStatus.FAILED,
      });
      throw new InternalServerErrorException('Failed to save extracted data');
    }
  }

  async editExtractedField(
    extractedDataId: string,
    dto: EditExtractedFieldDto,
  ): Promise<ExtractedData> {
    const field = await this.extractedDataRepository.findOne({
      where: { id: extractedDataId },
    });
    if (!field) throw new NotFoundException('Extracted field not found');

    field.editedValue = dto.editedValue ?? field.extractedValue;
    field.isEdited = true;
    return this.extractedDataRepository.save(field);
  }

  async remove(id: string): Promise<void> {
    const doc = await this.findById(id);
    try {
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
      await this.documentRepository.remove(doc);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async getDocumentChecklist(vendorId: string): Promise<
    Array<{ type: DocumentType; label: string; status: DocumentStatus; documentId?: string }>
  > {
    const documents = await this.findByVendor(vendorId);
    const docsByType = new Map(documents.map((d) => [d.documentType, d]));

    const requiredTypes = [
      { type: DocumentType.REGISTRATION_CERTIFICATE, label: 'Company Registration Certificate' },
      { type: DocumentType.GST_CERTIFICATE, label: 'GST / Tax Certificate' },
      { type: DocumentType.BANK_DOCUMENT, label: 'Bank Document' },
    ];

    return requiredTypes.map(({ type, label }) => {
      const doc = docsByType.get(type);
      return {
        type,
        label,
        status: doc ? doc.status : DocumentStatus.MISSING,
        documentId: doc?.id,
      };
    });
  }
}
