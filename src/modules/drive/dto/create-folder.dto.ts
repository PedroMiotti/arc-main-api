import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Name of the folder',
    example: 'Contratos',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'Parent folder id',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  ParentId?: number;

  @ApiProperty({
    description: 'Project id',
    example: 2,
  })
  @IsNumber()
  ProjectId?: number;
}
