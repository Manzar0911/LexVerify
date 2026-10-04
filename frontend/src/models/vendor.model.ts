export enum VendorStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  ACTION_REQUIRED = 'Action Required',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum VerificationStatus {
  VERIFIED = 'Verified',
  MISMATCH = 'Mismatch',
  UNABLE_TO_VERIFY = 'Unable_to_Verify',
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  gstNumber?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  status: VendorStatus;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorInput {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  registrationNumber: string;
  gstNumber?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
  changeReason?: string;
}
