import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VendorStatus } from './vendor-status.enum';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 255 })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  phone: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 100 })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gstNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bankAccountNumber: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ifscCode: string | null;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.DRAFT,
  })
  status: VendorStatus;

  @Column({ type: 'integer', default: 1 })
  currentVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
