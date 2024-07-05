import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateClientDto {
  @ApiProperty({
    description: 'Name of the client',
    example: 'Pedro Henrique',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'Document of the client',
    example: '48458026869',
  })
  @IsString()
  Document: string;

  @ApiProperty({
    description: 'User Phone number',
    example: '15999999999',
  })
  @IsString()
  @IsOptional()
  Phone?: string;

  @ApiProperty({
    description: 'Email of the client',
    example: 'client@mail.com',
  })
  @IsString()
  @IsEmail()
  Email: string;
}
