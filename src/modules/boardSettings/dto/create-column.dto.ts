import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({
    description: 'Description of the status',
    example: 'Em progresso',
  })
  @IsString()
  Description: string;

  @ApiProperty({
    description: 'Position of the column in the board',
    example: 1,
  })
  @IsNumber()
  Position: number;

  @ApiProperty({
    description: 'Project ID to which the status belongs to',
    example: 5,
  })
  @IsNumber()
  ProjectId: number;
}
