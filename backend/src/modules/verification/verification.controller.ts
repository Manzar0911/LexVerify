import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { VerificationResult } from './verification.entity';

@ApiTags('Verification')
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post(':vendorId')
  @ApiOperation({ summary: 'Trigger company verification for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Verification result', type: VerificationResult })
  async verify(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<VerificationResult> {
    return this.verificationService.verifyVendor(vendorId);
  }

  @Get(':vendorId')
  @ApiOperation({ summary: 'Get latest verification result for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Verification result', type: VerificationResult })
  async getResult(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<VerificationResult | null> {
    return this.verificationService.getVerificationResult(vendorId);
  }
}
