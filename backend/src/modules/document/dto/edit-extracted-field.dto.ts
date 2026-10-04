import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditExtractedFieldDto {
  @ApiPropertyOptional({ example: 'ABC Technologies Pvt Ltd' })
  @IsOptional()
  @IsString()
  editedValue?: string;
}
