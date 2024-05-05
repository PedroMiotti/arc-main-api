import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'password',
  })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}
