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
  Query,
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
import { PaginationResponse } from 'src/shared/pagination/pagination.util';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';

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

  @ApiOperation({ summary: 'Get all users by owner Id' })
  @Get()
  async findAllByOwner(
    @Jwt() claims: JwtClaims,
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Query('Query') query: string,
    @Res() response: Response,
  ) {
    const { skip, take, PageNumber, PageSize } = new PaginationFilter(
      pageNumber,
      pageSize,
    );
    const result = await this.userService.findAllByOwner(claims, take, skip, query);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
      Pagination: new PaginationResponse(
        result.totalPages,
        PageNumber,
        PageSize,
        result.totalObjects,
      ),
    });
  }

  @ApiOperation({ summary: 'Get a user by Id' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.userService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a user by Id' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() response: Response,
  ) {
    const result = await this.userService.update(+id, updateUserDto);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a user by Id' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.userService.remove(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
