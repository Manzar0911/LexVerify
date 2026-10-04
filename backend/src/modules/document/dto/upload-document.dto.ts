import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/document.enums';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.REGISTRATION_CERTIFICATE })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;
}
