import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';

@Entity('extracted_data')
export class ExtractedData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column({ length: 100 })
  fieldName: string;

  @Column({ type: 'text', nullable: true })
  extractedValue: string | null;

  @Column({ type: 'text', nullable: true })
  editedValue: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  confidenceScore: number | null;

  @Column({ default: false })
  isEdited: boolean;

  @CreateDateColumn()
  extractedAt: Date;
}
