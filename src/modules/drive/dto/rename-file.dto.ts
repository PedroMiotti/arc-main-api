import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RenameFileDto {
  @ApiProperty({
    description: 'Name of the file',
    example: 'Teste',
  })
  @IsString()
  name: string;
}
