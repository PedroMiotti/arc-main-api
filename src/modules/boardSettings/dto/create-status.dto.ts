import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateStatusDto {
  @ApiProperty({
    description: 'Description of the status',
    example: 'Pedro Henrique',
  })
  @IsString()
  Description: string;

  @ApiProperty({
    description: 'Type of the status (1 - To do, 2 - In progress, 3 - Done, 4 - Cancelled)',
    example: 1,
  })
  @IsNumber()
  BoardStatusTypeId: number;

  @ApiProperty({
    description: 'Project ID to which the status belongs to',
    example: 5,
  })
  @IsNumber()
  ProjectId: number;
}
