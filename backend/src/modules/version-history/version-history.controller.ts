import { Controller, Get, Post, Param, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { VersionHistoryService } from './version-history.service';
import { VendorVersion } from './entities/vendor-version.entity';
import { Vendor } from '../vendor/entities/vendor.entity';

@ApiTags('Version History')
@Controller('vendors')
export class VersionHistoryController {
  constructor(private readonly versionHistoryService: VersionHistoryService) {}

  @Get(':vendorId/versions')
  @ApiOperation({ summary: 'Get version history for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: [VendorVersion] })
  async getHistory(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<VendorVersion[]> {
    return this.versionHistoryService.getHistory(vendorId);
  }

  @Post(':vendorId/versions/:versionNumber/restore')
  @ApiOperation({ summary: 'Restore a previous version of vendor details' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'versionNumber', type: 'number' })
  @ApiResponse({ status: 201, description: 'Restored vendor', type: Vendor })
  async restore(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
  ): Promise<Vendor> {
    return this.versionHistoryService.restoreVersion(vendorId, versionNumber);
  }
}
