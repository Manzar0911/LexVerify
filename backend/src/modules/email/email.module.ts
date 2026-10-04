import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailLog } from './email-log.entity';
import { VendorModule } from '../vendor/vendor.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog]), VendorModule, DocumentModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
