import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorModule } from './modules/vendor/vendor.module';
import { DocumentModule } from './modules/document/document.module';
import { AiModule } from './modules/ai/ai.module';
import { VerificationModule } from './modules/verification/verification.module';
import { EmailModule } from './modules/email/email.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { VersionHistoryModule } from './modules/version-history/version-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        database: configService.get<string>('DB_NAME', 'vendor_verification'),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        logging: true,
      }),
      inject: [ConfigService],
    }),
    VendorModule,
    DocumentModule,
    AiModule,
    VerificationModule,
    EmailModule,
    WorkflowModule,
    VersionHistoryModule,
  ],
})
export class AppModule {}
