import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageToNoteDto {
  @ApiProperty({
    description: 'Id of the image block inside the content',
    example: '5XvxBfs8YF',
  })
  @IsString()
  BlockId: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  Image: string;
}
