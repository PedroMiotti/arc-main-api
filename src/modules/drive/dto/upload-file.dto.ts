import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({
    description: 'Parent folder id',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => +value)
  FolderId?: number;

  @ApiProperty({
    description: 'Project id',
    example: 2,
  })
  @IsNumber()
  @Transform(({ value }) => +value)
  ProjectId: number;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  File: Express.Multer.File;
}
