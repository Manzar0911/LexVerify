import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AiService, ComparisonEntry, ExtractedFields } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract/:documentId')
  @ApiOperation({ summary: 'Trigger AI extraction for a document' })
  @ApiParam({ name: 'documentId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Extraction result' })
  async extract(
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ): Promise<ExtractedFields> {
    return this.aiService.extractDocument(documentId);
  }

  @Get('compare/:vendorId')
  @ApiOperation({ summary: 'Run cross-document AI comparison for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Comparison result' })
  async compare(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<ComparisonEntry[]> {
    return this.aiService.compareDocuments(vendorId);
  }
}
