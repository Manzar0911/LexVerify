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
