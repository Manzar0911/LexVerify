import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentType, DocumentStatus, ExtractionStatus } from './document.enums';
import { Vendor } from '../../vendor/entities/vendor.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'text' })
  filePath: string;

  @Column({ type: 'integer', nullable: true })
  fileSize: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType: string | null;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.AVAILABLE,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: ExtractionStatus,
    default: ExtractionStatus.PENDING,
  })
  extractionStatus: ExtractionStatus;

  @CreateDateColumn()
  uploadedAt: Date;
}
