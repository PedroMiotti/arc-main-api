import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Name of the task',
    example: 'Assinar documento de contrato',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'Description of the task',
    example:
      'Assinar documento de contrato com a empresa X e entregar na prefeitura',
  })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiProperty({
    description:
      'Estimated time to complete the task (h: hours, d: days, w: weeks, m: months)',
    example: '2h',
  })
  @IsString()
  @IsOptional()
  EstimatedTime?: string;

  @ApiProperty({
    description: 'The Phase Id that the task belongs to. If not specified, it will go to the backlog.',
    example: 1,
  })
  @IsNumber()
  PhaseId: number;

  @ApiProperty({
    description: 'The project ID that the task belongs to',
    example: 1,
  })
  @IsNumber()
  ProjectId: number;

  @ApiProperty({
    description: 'Status ID of the task',
    example: 1,
  })
  @IsNumber()
  StatusId: number;

  @ApiProperty({
    description: 'Assigned user ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  AssignTo: number;

  @ApiProperty({
    description: 'Start date of the task',
    example: '2021-01-01',
  })
  @IsDateString()
  @IsOptional()
  StartDate: string;

  @ApiProperty({
    description: 'End date of the task',
    example: '2021-01-01',
  })
  @IsDateString()
  @IsOptional()
  EndDate: string;
}
