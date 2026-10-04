import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { EmailLog } from './email-log.entity';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('missing-documents/:vendorId')
  @ApiOperation({ summary: 'Send missing document email to vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Email send result' })
  async sendMissingDocEmail(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<{ sent: boolean; missingDocs: string[] }> {
    return this.emailService.sendMissingDocumentEmail(vendorId);
  }

  @Get('logs/:vendorId')
  @ApiOperation({ summary: 'Get email logs for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Email logs', type: [EmailLog] })
  async getLogs(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<EmailLog[]> {
    return this.emailService.getEmailLogs(vendorId);
  }
}
