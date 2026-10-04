import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VendorStatus } from '../../vendor/entities/vendor-status.enum';

export class UpdateWorkflowStatusDto {
  @ApiProperty({ enum: VendorStatus, example: VendorStatus.UNDER_REVIEW })
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @ApiPropertyOptional({ example: 'Missing bank document detected' })
  @IsOptional()
  @IsString()
  reason?: string;
}
