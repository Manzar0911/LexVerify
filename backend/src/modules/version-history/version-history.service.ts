import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorVersion } from './entities/vendor-version.entity';
import { VendorService } from '../vendor/vendor.service';
import { Vendor } from '../vendor/entities/vendor.entity';

// Fields to track in version history (exclude id, timestamps)
const TRACKED_FIELDS: Array<keyof Vendor> = [
  'companyName',
  'contactPerson',
  'email',
  'phone',
  'address',
  'registrationNumber',
  'gstNumber',
  'bankAccountNumber',
  'ifscCode',
  'status',
];

@Injectable()
export class VersionHistoryService {
  constructor(
    @InjectRepository(VendorVersion)
    private readonly versionRepository: Repository<VendorVersion>,
    @Inject(forwardRef(() => VendorService))
    private readonly vendorService: VendorService,
  ) {}

  async recordChange(
    vendorId: string,
    previousVendor: Partial<Vendor> | null,
    newVendor: Vendor,
    changedBy = 'system',
  ): Promise<void> {
    try {
      const snapshot: Record<string, unknown> = {};
      TRACKED_FIELDS.forEach((f) => {
        snapshot[f] = newVendor[f];
      });

      if (!previousVendor) {
        // First version — record initial profile creation
        await this.versionRepository.save(
          this.versionRepository.create({
            vendorId,
            versionNumber: newVendor.currentVersion || 1,
            fieldName: 'ALL',
            previousValue: null,
            newValue: 'Initial vendor registration profile',
            changedBy,
            snapshot,
          }),
        );
        return;
      }

      // Record per-field changes
      const changes = TRACKED_FIELDS.filter(
        (f) => String(previousVendor[f] ?? '') !== String(newVendor[f] ?? ''),
      );

      const versionNumber = newVendor.currentVersion || 1;

      if (changes.length === 0) {
        // Record general version event (e.g. status transition or restore)
        await this.versionRepository.save(
          this.versionRepository.create({
            vendorId,
            versionNumber,
            fieldName: 'PROFILE',
            previousValue: null,
            newValue: `Profile checkpoint - ${changedBy}`,
            changedBy,
            snapshot,
          }),
        );
        return;
      }

      const entries = changes.map((field) =>
        this.versionRepository.create({
          vendorId,
          versionNumber,
          fieldName: String(field),
          previousValue: String(previousVendor[field] ?? ''),
          newValue: String(newVendor[field] ?? ''),
          changedBy,
          snapshot,
        }),
      );
      await this.versionRepository.save(entries);
    } catch (err) {
      console.warn(`[VersionHistoryService] Failed to record change:`, err);
    }
  }

  async getHistory(vendorId: string): Promise<VendorVersion[]> {
    let history = await this.versionRepository.find({
      where: { vendorId },
      order: { versionNumber: 'DESC', changedAt: 'DESC' },
    });

    if (history.length === 0) {
      // Auto-create initial baseline version 1 if none exists in database
      try {
        const vendor = await this.vendorService.findById(vendorId);
        if (vendor) {
          const snapshot: Record<string, unknown> = {};
          TRACKED_FIELDS.forEach((f) => {
            snapshot[f] = vendor[f];
          });
          const initialVersion = this.versionRepository.create({
            vendorId,
            versionNumber: 1,
            fieldName: 'ALL',
            previousValue: null,
            newValue: 'Initial vendor registration profile',
            changedBy: 'Initial Registration',
            snapshot,
          });
          await this.versionRepository.save(initialVersion);
          history = [initialVersion];
        }
      } catch {
        // Safe fallback
      }
    }

    return history;
  }

  async restoreVersion(vendorId: string, versionNumber: number): Promise<Vendor> {
    const versionRecord = await this.versionRepository.findOne({
      where: { vendorId, versionNumber },
      order: { changedAt: 'DESC' },
    });
    if (!versionRecord) {
      throw new NotFoundException(`Version ${versionNumber} not found for vendor`);
    }

    const snapshot = (versionRecord.snapshot || {}) as Record<string, any>;

    // Restore: update vendor with snapshot values and create a new append-only version
    const restored = await this.vendorService.update(
      vendorId,
      {
        companyName: snapshot.companyName,
        contactPerson: snapshot.contactPerson,
        email: snapshot.email,
        phone: snapshot.phone,
        address: snapshot.address,
        registrationNumber: snapshot.registrationNumber,
        gstNumber: snapshot.gstNumber,
        bankAccountNumber: snapshot.bankAccountNumber,
        ifscCode: snapshot.ifscCode,
      },
      `Restore to Version ${versionNumber}`,
    );

    return restored;
  }
}
