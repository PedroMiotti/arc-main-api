import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PhaseService } from './phase.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { handleResponse } from 'src/shared/http/handle-response';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';
import { PaginationResponse } from 'src/shared/pagination/pagination.util';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@ApiTags('Project Phase')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('phase')
export class PhaseController {
  constructor(private readonly phaseService: PhaseService) {}

  @ApiOperation({ summary: 'Create a new phase' })
  @Post()
  async create(
    @Body() createPhaseDto: CreatePhaseDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.phaseService.create(claims, createPhaseDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Initialize Phase' })
  @Patch(':Id/initialize')
  async initialize(@Param('Id') id: string, @Res() response: Response) {
    const result = await this.phaseService.initialize(Number(id));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Conclude Phase' })
  @Patch(':Id/conclude')
  async conclude(@Param('Id') id: string, @Res() response: Response) {
    const result = await this.phaseService.conclude(Number(id));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Find all by Project ID' })
  @Get('project/:projectId')
  async findAllByProject(
    @Param('projectId') projectId: number,
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Res() response: Response,
  ) {
    const { skip, take, PageNumber, PageSize } = new PaginationFilter(
      pageNumber,
      pageSize,
    );
    const result = await this.phaseService.findAllByProjectId(
      Number(projectId),
      take,
      skip,
    );

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

  @ApiOperation({ summary: 'Get a phase by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.phaseService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a phase by ID' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePhaseDto: UpdatePhaseDto,
    @Res() response: Response,
  ) {
    const result = await this.phaseService.update(+id, updatePhaseDto);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a phase by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.phaseService.remove(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
