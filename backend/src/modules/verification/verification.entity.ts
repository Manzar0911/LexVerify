import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../vendor/entities/vendor.entity';

export enum VerificationStatus {
  VERIFIED = 'Verified',
  MISMATCH = 'Mismatch',
  UNABLE_TO_VERIFY = 'Unable_to_Verify',
}

@Entity('verification_results')
export class VerificationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'enum', enum: VerificationStatus })
  status: VerificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  apiData: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  mismatchFields: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiCompanyName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiRegistrationNumber: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn()
  verifiedAt: Date;
}
