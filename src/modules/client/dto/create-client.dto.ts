import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
} from 'class-validator';


export class CreateClientDto {
  @ApiProperty({
    description: 'Name of the user',
    example: 'Pedro Henrique',
  })
  @IsString()
  Name: string;

  @ApiProperty({
    description: 'User Phone number',
    example: '15999999999',
  })
  @IsString()
  @IsOptional()
  Phone?: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'user@mail.com',
  })
  @IsString()
  @IsEmail()
  Email: string;
}
