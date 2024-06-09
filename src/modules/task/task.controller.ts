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
import { TaskService } from './task.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { handleResponse } from 'src/shared/http/handle-response';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';
import { PaginationResponse } from 'src/shared/pagination/pagination.util';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Project Task')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiOperation({ summary: 'Create a new task' })
  @Post()
  async create(
    @Body() createPhaseDto: CreateTaskDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.taskService.create(claims, createPhaseDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Find all by Phase ID' })
  @Get('phase/:PhaseId')
  async findAllByPhase(
    @Param('PhaseId') phaseId: number,
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Res() response: Response,
  ) {
    const { skip, take, PageNumber, PageSize } = new PaginationFilter(
      pageNumber,
      pageSize,
    );
    const result = await this.taskService.findAllByPhase(
      Number(phaseId),
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

  @ApiOperation({ summary: 'Find all by project' })
  @Get('project/:ProjectId')
  async findAllByProject(
    @Param('ProjectId') projectId: number,
    @Res() response: Response,
  ) {
    const result = await this.taskService.findAllByProject(Number(projectId));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get a task by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.taskService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a task by ID' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Res() response: Response,
  ) {
    const result = await this.taskService.update(+id, updateTaskDto);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a task by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.taskService.remove(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
