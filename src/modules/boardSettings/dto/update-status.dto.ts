import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Description of the status',
    example: 'Pedro Henrique',
  })
  @IsString()
  @IsOptional()
  Description: string;

  @ApiProperty({
    description:
      'Type of the status (1 - To do, 2 - In progress, 3 - Done, 4 - Cancelled)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  BoardStatusTypeId?: number;

  @ApiProperty({
    description: 'The column id of the status',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  BoardColumnId?: number;
}
