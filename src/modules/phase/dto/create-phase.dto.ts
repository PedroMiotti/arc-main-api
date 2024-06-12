import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Description of the phase',
    example: 'Pré-Projeto',
  })
  @IsString()
  Description: string;

  @ApiProperty({
    description: 'Color Id of the phase',
    example: 1,
  })
  @IsNumber()
  ColorId: number;

  @ApiProperty({
    description: 'Project Id',
    example: 1,
  })
  @IsNumber()
  ProjectId: number;

  @ApiProperty({
    description: 'Start date of the phase',
    example: '2021-01-01',
  })
  @IsDateString()
  @IsOptional()
  StartDate?: string;

  @ApiProperty({
    description: 'End date of the phase',
    example: '2021-02-01',
  })
  @IsDateString()
  @IsOptional()
  EndDate: string;
}
