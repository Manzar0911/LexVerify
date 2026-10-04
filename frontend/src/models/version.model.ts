import { Vendor, VerificationStatus } from './vendor.model';

export interface VendorVersion {
  id: string;
  vendorId: string;
  versionNumber: number;
  fieldName?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  changedBy: string;
  snapshot: Vendor;
  changedAt: string;
}

export interface VerificationResult {
  id: string;
  vendorId: string;
  status: VerificationStatus;
  apiCompanyName?: string | null;
  apiRegistrationNumber?: string | null;
  apiData?: Record<string, unknown> | null;
  mismatchFields?: Record<string, unknown> | null;
  errorMessage?: string | null;
  verifiedAt: string;
}
