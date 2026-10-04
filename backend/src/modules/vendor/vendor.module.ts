import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { Vendor } from './entities/vendor.entity';
import { VersionHistoryModule } from '../version-history/version-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), forwardRef(() => VersionHistoryModule)],
  controllers: [VendorController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
