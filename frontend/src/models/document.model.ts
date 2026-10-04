export enum DocumentType {
  REGISTRATION_CERTIFICATE = 'registration_certificate',
  GST_CERTIFICATE = 'gst_certificate',
  BANK_DOCUMENT = 'bank_document',
}

export enum DocumentStatus {
  AVAILABLE = 'Available',
  MISSING = 'Missing',
  VERIFIED = 'Verified',
}

export enum ExtractionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface ExtractedDataField {
  id: string;
  documentId: string;
  fieldName: string;
  extractedValue: string | null;
  editedValue: string | null;
  confidenceScore: number | null;
  isEdited: boolean;
  extractedAt: string;
}

export interface VendorDocument {
  id: string;
  vendorId: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  extractionStatus: ExtractionStatus;
  uploadedAt: string;
  extractedFields?: ExtractedDataField[];
}

export type DocumentChecklistResponse = Record<string, DocumentStatus>;

export interface EditExtractedFieldInput {
  editedValue: string;
}
