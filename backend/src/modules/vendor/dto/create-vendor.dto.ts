import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'ABC Technologies Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  contactPerson: string;

  @ApiProperty({ example: 'john@abctech.com' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7, { message: 'Phone number must have at least 7 characters' })
  @MaxLength(25, { message: 'Phone number must not exceed 25 characters' })
  phone: string;

  @ApiProperty({ example: '123 Main Street, Mumbai, Maharashtra 400001' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  address: string;

  @ApiProperty({ example: 'REG123456' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  registrationNumber: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1Z1' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  @ApiPropertyOptional({ example: 'Initial registration' })
  @IsOptional()
  @IsString()
  changeReason?: string;
}

