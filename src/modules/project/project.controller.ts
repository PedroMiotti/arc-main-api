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
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { handleResponse } from 'src/shared/http/handle-response';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';
import { PaginationResponse } from 'src/shared/pagination/pagination.util';

@ApiTags('Project')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @ApiOperation({ summary: 'Create a new Project' })
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

  @ApiOperation({ summary: 'List all user projects' })
  @Get()
  async findAll(
    @Jwt() claims: JwtClaims,
    @Query('PageNumber') pageNumber: number,
    @Query('PageSize') pageSize: number,
    @Res() response: Response,
  ) {
    const { skip, take, PageNumber, PageSize } = new PaginationFilter(
      pageNumber,
      pageSize,
    );

    const result = await this.projectService.findAllUserProjects(
      claims,
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

  @ApiOperation({ summary: 'Find project by Id' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.projectService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Assign a user to a project' })
  @Patch(':id/user/:userId')
  async assignUserToProject(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Jwt() claims: JwtClaims,
    @Res() response: Response,
  ) {
    const result = await this.projectService.assignUserToProject(
      claims,
      +userId,
      +id,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Toggle a project as favorite' })
  @Patch(':id/favorite/:action')
  @ApiParam({ name: 'action', enum: ['Favorite', 'Unfavorite'] })
  async toggleFavoriteProject(
    @Param('id') id: string,
    @Param('action') action: 'Favorite' | 'Unfavorite',
    @Jwt() claims: JwtClaims,
    @Res() response: Response,
  ) {
    const result = await this.projectService.toggleFavoriteProject(
      claims,
      +id,
      action,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update project by ID' })
  @Patch(':id')
  async update(
    @Jwt() claims: JwtClaims,
    @Res() response: Response,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    const result = await this.projectService.update(
      claims,
      +id,
      updateProjectDto,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a project by ID' })
  @Delete(':id')
  async remove(
    @Jwt() claims: JwtClaims,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const result = await this.projectService.remove(claims, +id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'List all categories' })
  @Get('categories/all')
  async findAllCategories(@Res() response: Response) {
    const result = await this.projectService.findAllCategories();

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'List all members' })
  @Get(':id/members/all')
  async findAllMembers(@Res() response: Response, @Param('id') id: string) {
    const result = await this.projectService.findAllMembers(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
