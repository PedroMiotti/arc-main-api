import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Name of the project',
    example: 'Project 1',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'Tag of the project',
    example: '2024_02',
  })
  @IsString()
  @IsOptional()
  Tag: string;

  @ApiProperty({
    description: 'Active phase id of the project',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  ActivePhaseId?: number;

  @ApiProperty({
    description: 'Category id of the project',
    example: 1,
  })
  @IsNumber()
  CategoryId: number;

  @ApiProperty({
    description: 'User Id that will be the leader of the project',
    example: 1,
  })
  @IsNumber()
  LeaderId: number;

  @ApiProperty({
    description: 'Client Id of the project',
    example: 1,
  })
  @IsNumber()
  ClientId: number;

  @ApiProperty({
    description: 'When the project has started or will start',
    example: '2024-02-01',
  })
  @IsDateString()
  StartAt: string;

  @ApiProperty({
    description: 'When the project has ended or will end',
    example: '2025-02-01',
  })
  @IsDateString()
  @IsOptional()
  EndAt: string;
}
