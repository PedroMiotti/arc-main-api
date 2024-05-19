import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { handleResponse } from 'src/shared/http/handle-response';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';
import { PaginationResponse } from 'src/shared/pagination/pagination.util';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { Response } from 'express';
import { UpdateClientDto } from './dto/update-client.dto';

@ApiTags('Client')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Create a new client' })
  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.clientService.create(claims, createClientDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get all clients by owner' })
  @Get()
  async findAllByOwner(
    @Jwt() claims: JwtClaims,
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Res() response: Response,
  ) {
    const { skip, take, PageNumber, PageSize } = new PaginationFilter(
      pageNumber,
      pageSize,
    );
    const result = await this.clientService.findAllByOwner(claims, take, skip);

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

  @ApiOperation({ summary: 'Get a client by Id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update a client by Id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @ApiOperation({ summary: 'Delete a client by Id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
