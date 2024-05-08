import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { handleResponse } from 'src/shared/http/handle-response';
import { OkResult } from 'src/shared/result/result.interface';
import { Project } from '@prisma/client';

@ApiTags('Project')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create a new Project' })
  @ApiResponse({
    status: 200,
    description: 'Result object with new Project data',
    type: typeof OkResult<Project>,
  })
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.projectService.create(claims, createProjectDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'List all projects' })
  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @ApiOperation({ summary: 'Find project by Id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update project by Id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto);
  }

  @ApiOperation({ summary: 'Delete project by Id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(+id);
  }
}
