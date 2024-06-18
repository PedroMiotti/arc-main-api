import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNoteDto } from './create-note.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {
  @ApiProperty({
    description: 'Content of the note',
    example: 'Nota teste',
  })
  @IsString()
  @IsOptional()
  Content: string;
}
