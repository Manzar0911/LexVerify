import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vendor } from '../../vendor/entities/vendor.entity';

@Entity('workflow_logs')
export class WorkflowLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vendorId' })
  vendor: Vendor;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fromStatus: string | null;

  @Column({ type: 'varchar', length: 50 })
  toStatus: string;

  @Column({ type: 'varchar', length: 50, default: 'user' })
  triggeredBy: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  changedAt: Date;
}
