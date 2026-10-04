import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionHistoryController } from './version-history.controller';
import { VersionHistoryService } from './version-history.service';
import { VendorVersion } from './entities/vendor-version.entity';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorVersion]),
    forwardRef(() => VendorModule),
  ],
  controllers: [VersionHistoryController],
  providers: [VersionHistoryService],
  exports: [VersionHistoryService],
})
export class VersionHistoryModule {}
