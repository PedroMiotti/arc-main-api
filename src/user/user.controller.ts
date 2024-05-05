import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { handleResponse } from 'src/shared/http/handle-response';
import { Response } from 'express';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { PublicRoute } from 'src/shared/http/is-public-route.decorator';

@ApiTags('User')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @PublicRoute()
  @ApiOperation({ summary: 'Create a new User' })
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.userService.create(createUserDto, claims);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @Get()
  findAll(@Jwt() claims: JwtClaims) {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
