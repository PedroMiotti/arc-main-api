import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePhaseDto {
  @ApiProperty({
    description: 'Title of the phase',
    example: 'Pré-Projeto',
  })
  @IsString()
  Title: string;

  @ApiProperty({
    description: 'Description of the phase',
    example: 'Pré-Projeto',
  })
  @IsString()
  @IsOptional()
  Description: string;

  @ApiProperty({
    description: 'Description in HTML of the phase',
    example: '<b>Pré-Projeto</b>',
  })
  @IsString()
  @IsOptional()
  DescriptionHtml: string;

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
  StartAt?: string;

  @ApiProperty({
    description: 'End date of the phase',
    example: '2021-02-01',
  })
  @IsDateString()
  @IsOptional()
  EndAt: string;
}
