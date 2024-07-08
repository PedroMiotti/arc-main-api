import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateOrganizationSettingsDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Escritório de Arquitetura 1',
  })
  @IsString()
  Name: string;
  
  @ApiProperty({
    description: 'Owner Id of the organization',
    example: 5,
  })
  @IsString()
  OwnerId: string;

  @ApiProperty({ required: true, type: 'string', format: 'binary' })
  LogoImage: Express.Multer.File;
}
