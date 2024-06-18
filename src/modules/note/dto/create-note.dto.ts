import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Title of the note',
    example: 'Nota teste',
  })
  @IsString()
  Title: string;

  @ApiProperty({
    description: 'Project Id',
    example: 1,
  })
  @IsNumber()
  ProjectId: number;
}
