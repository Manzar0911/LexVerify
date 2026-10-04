import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { VendorStatus } from './entities/vendor-status.enum';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VersionHistoryService } from '../version-history/version-history.service';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @Inject(forwardRef(() => VersionHistoryService))
    private readonly versionHistoryService?: VersionHistoryService,
  ) {}

  async create(dto: CreateVendorDto): Promise<Vendor> {
    try {
      const vendor = this.vendorRepository.create({
        ...dto,
        status: VendorStatus.DRAFT,
        currentVersion: 1,
      });
      const saved = await this.vendorRepository.save(vendor);

      if (this.versionHistoryService) {
        await this.versionHistoryService
          .recordChange(saved.id, null, saved, 'Initial Registration')
          .catch(() => {});
      }

      return saved;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create vendor');
    }
  }

  async findAll(): Promise<Vendor[]> {
    try {
      return await this.vendorRepository.find({
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch vendors');
    }
  }

  async findById(id: string): Promise<Vendor> {
    try {
      const vendor = await this.vendorRepository.findOne({ where: { id } });
      if (!vendor) {
        throw new NotFoundException(`Vendor with id "${id}" not found`);
      }
      return vendor;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch vendor');
    }
  }

  async update(
    id: string,
    dto: UpdateVendorDto,
    changedBy = 'Vendor Profile Update',
  ): Promise<Vendor> {
    const vendor = await this.findById(id);
    const previousSnapshot: Vendor = { ...vendor };

    try {
      const nextVersion = (vendor.currentVersion || 1) + 1;
      const updated = await this.vendorRepository.save({
        ...vendor,
        ...dto,
        currentVersion: nextVersion,
      });

      if (this.versionHistoryService) {
        await this.versionHistoryService
          .recordChange(id, previousSnapshot, updated, changedBy)
          .catch(() => {});
      }

      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update vendor');
    }
  }

  async updateStatus(
    id: string,
    status: VendorStatus,
    changedBy = 'Workflow State Transition',
  ): Promise<Vendor> {
    const vendor = await this.findById(id);
    const previousSnapshot: Vendor = { ...vendor };

    try {
      const nextVersion = (vendor.currentVersion || 1) + 1;
      vendor.status = status;
      vendor.currentVersion = nextVersion;
      const updated = await this.vendorRepository.save(vendor);

      if (this.versionHistoryService) {
        await this.versionHistoryService
          .recordChange(id, previousSnapshot, updated, changedBy)
          .catch(() => {});
      }

      return updated;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update vendor status');
    }
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findById(id);
    try {
      await this.vendorRepository.remove(vendor);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete vendor');
    }
  }
}
