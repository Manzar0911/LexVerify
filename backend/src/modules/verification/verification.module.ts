import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationResult } from './verification.entity';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [TypeOrmModule.forFeature([VerificationResult]), VendorModule],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
