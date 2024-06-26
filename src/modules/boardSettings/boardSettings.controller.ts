import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BoardSettingsService } from './boardSettings.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { handleResponse } from 'src/shared/http/handle-response';
import { Response } from 'express';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@ApiTags('Board Settings')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('board/settings')
export class BoardSettingsController {
  constructor(private readonly boardSettingsService: BoardSettingsService) {}

  @ApiOperation({ summary: 'Create a new status' })
  @Post('status')
  async createStatus(
    @Body() createStatusDto: CreateStatusDto,
    @Res() response: Response,
  ) {
    const result =
      await this.boardSettingsService.createStatus(createStatusDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a status' })
  @Patch('status/:id')
  async updateStatus(
    @Param('id') id: number,
    @Body() updatedBoardStatusDto: UpdateStatusDto,
    @Res() response: Response,
  ) {
    const result = await this.boardSettingsService.updateStatus(
      id,
      updatedBoardStatusDto,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a status' })
  @Delete('status/:id')
  async deleteStatus(@Param('id') id: number, @Res() response: Response) {
    const result = await this.boardSettingsService.deleteStatus(id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get all statuses' })
  @Get('project/:id/statuses')
  async findAllStatuses(@Param('id') id: string, @Res() response: Response) {
    const result = await this.boardSettingsService.getProjectStatuses(
      Number(id),
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Create column' })
  @Post('column')
  async createColumn(
    @Body() createColumnDto: CreateColumnDto,
    @Res() response: Response,
  ) {
    const result =
      await this.boardSettingsService.createColumn(createColumnDto);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a column' })
  @Patch('column/:id')
  async updateColumn(
    @Param('id') id: number,
    @Body() updatedBoardColumnDto: UpdateColumnDto,
    @Res() response: Response,
  ) {
    const result = await this.boardSettingsService.updateColumn(
      id,
      updatedBoardColumnDto,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a column' })
  @Delete('column/:id')
  async deleteColumn(@Param('id') id: number, @Res() response: Response) {
    const result = await this.boardSettingsService.deleteColumn(id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get all columns' })
  @Get('project/:id/columns')
  async findAllColumns(@Param('id') id: string, @Res() response: Response) {
    const result = await this.boardSettingsService.getProjectColumns(
      Number(id),
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
