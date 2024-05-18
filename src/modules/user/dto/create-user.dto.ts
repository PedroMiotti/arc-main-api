import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

enum DocumentType {
  CPF = 'CPF',
  CNPJ = 'CNPJ',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Pedro Henrique',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'Document of the user (CPF or CNPJ)',
    example: '00000000000',
  })
  @IsString()
  @IsOptional()
  Document?: string;

  @ApiProperty({
    description: 'Document type (CPF or CNPJ)',
    example: 'CPF',
  })
  @IsEnum(DocumentType)
  @IsOptional()
  DocumentType?: string;

  @ApiProperty({
    description: 'User Phone number',
    example: '15999999999',
  })
  @IsString()
  @IsOptional()
  Phone?: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@mail.com',
  })
  @IsString()
  @IsEmail()
  Email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: '123456',
  })
  @IsString()
  @IsOptional()
  Password?: string;

  @ApiProperty({
    description: 'Is the user active?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @ApiProperty({
    description: 'User role Id',
  })
  @IsNumber()
  @IsOptional()
  RoleId?: number;

  @ApiProperty({
    description: 'User type ID (1 - Admin, 2 - Common). Defaults to 2.',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  UserTypeId?: number;

  @ApiProperty({
    description:
      'Invitation status ID (1 - Pending, 2 - Accepted, 3 - Rejected). Defaults to 1.',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  InvitationStatusId?: number;
}
