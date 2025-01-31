import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthenticateDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@email.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: '123456',
  })
  @IsString()
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}


export class AuthenticateClientDto {
  @ApiProperty({
    description: 'Document of the client',
    example: '48458026864',
  })
  @IsString()
  document: string;

  constructor(document: string) {
    this.document = document;
  }
}
