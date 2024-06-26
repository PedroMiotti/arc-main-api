import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateColumnDto {
  @ApiProperty({
    description: 'Description of the status',
    example: 'Em progresso',
  })
  @IsString()
  @IsOptional()
  Description?: string;

  @ApiProperty({
    description: 'Position of the column in the board',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  Position?: number;
}