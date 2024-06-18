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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { handleResponse } from 'src/shared/http/handle-response';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { PaginationFilter } from 'src/shared/pagination/pagination-filter';
import { PaginationResponse } from 'src/shared/pagination/pagination.util';
import { NoteService } from './note.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UploadImageToNoteDto } from './dto/upload-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Project Notes')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @ApiOperation({ summary: 'Create a new note' })
  @Post()
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.noteService.create(claims, createNoteDto);

    handleResponse(response, HttpStatus.CREATED, {
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
    const result = await this.noteService.findAllByProjectId(
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

  @ApiOperation({ summary: 'Get a note by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.noteService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a note by ID' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.noteService.update(claims, +id, updateNoteDto);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete a note by ID' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() response: Response) {
    const result = await this.noteService.remove(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Upload an image to a note' })
  @Post('/:id/image/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('Image'))
  async uploadNoteImage(
    @Param('id') id: string,
    @Body() dto: UploadImageToNoteDto,
    @Res() response: Response,
  ) {
    const result = await this.noteService.uploadImageToNote(+id, dto);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
