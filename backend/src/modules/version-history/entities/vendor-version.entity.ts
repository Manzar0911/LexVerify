import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../../vendor/entities/vendor.entity';

@Entity('vendor_versions')
export class VendorVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'integer' })
  versionNumber: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fieldName: string | null;

  @Column({ type: 'text', nullable: true })
  previousValue: string | null;

  @Column({ type: 'text', nullable: true })
  newValue: string | null;

  @Column({ type: 'varchar', length: 255, default: 'system' })
  changedBy: string;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, unknown>;

  @CreateDateColumn()
  changedAt: Date;
}
