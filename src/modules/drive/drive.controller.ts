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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FolderService } from './modules/folder/folder.service';
import { FileService } from './modules/file/file.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { Response } from 'express';
import { handleResponse } from 'src/shared/http/handle-response';
import { UpdateFolderDto } from './dto/update-folder';
import { UploadFileDto } from './dto/upload-file.dto';
import { Status } from 'src/shared/result/status.enum';
import { RenameFileDto } from './dto/rename-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Drive')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('drive')
export class DriveController {
  constructor(
    private readonly folderService: FolderService,
    private readonly fileService: FileService,
  ) {}

  @ApiOperation({ summary: 'Create folder' })
  @Post('folder')
  async createFolder(
    @Body() folder: CreateFolderDto,
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
  ) {
    const result = await this.folderService.createFolder(claims, folder);

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Delete folder' })
  @Delete('folder/:id')
  async deleteFolder(@Param('id') id: string, @Res() response: Response) {
    const result = await this.folderService.deleteFolder(Number(id));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
    });
  }

  @ApiOperation({ summary: 'Update folder' })
  @Patch('folder/:id')
  async updateFolder(
    @Param('id') id: string,
    @Body() folder: UpdateFolderDto,
    @Res() response: Response,
  ) {
    const result = await this.folderService.updateFolder(Number(id), folder);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
    });
  }

  @ApiOperation({ summary: 'Get folder content by Id' })
  @Get('folder/:id')
  async getFolderContent(@Param('id') id: string, @Res() response: Response) {
    const result = await this.folderService.getFolderContent(Number(id));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get project folder content.' })
  @Get('folder/project/:id')
  async getRootFolderForProject(
    @Param('id') id: string,
    @Query('FolderId') folderId: string,
    @Res() response: Response,
  ) {
    const result = await this.folderService.getRootFolderForProject(
      Number(id),
      folderId ? Number(folderId) : null,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Download folder in .zip format' })
  @Get('folder/:id/download')
  async download(@Param('id') id: string, @Res() response: Response) {
    const file = await this.folderService.downloadFolder(Number(id));

    response.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="pasta-${id}.zip"`,
    });

    file.getStream().pipe(response);
  }

  @ApiOperation({ summary: 'Upload file' })
  @Post('file')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('File'))
  async uploadFile(
    @Res() response: Response,
    @Jwt() claims: JwtClaims,
    @Body() dto: UploadFileDto,
    @UploadedFile() fileBinary: Express.Multer.File,
  ) {
    dto.File = fileBinary;
    const result = await this.fileService.uploadFile(claims, dto);

    if (!result.ok || result.data === null) {
      switch (result.status) {
        case Status.InternalException:
          handleResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, {
            Error: {
              Status: HttpStatus.INTERNAL_SERVER_ERROR,
              Title: result.status,
              Description: result.message,
            },
          });
          return;
        default:
      }
    }

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Move file' })
  @Patch('file/:id/folder/:folderId')
  async moveFile(
    @Param('id') id: string,
    @Param('folderId') destinationFolderId: string,
    @Res() response: Response,
  ) {
    const result = await this.fileService.moveFile(
      Number(id),
      Number(destinationFolderId),
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
    });
  }

  @ApiOperation({ summary: 'Delete file' })
  @Delete('file/:id')
  async deleteFile(@Param('id') id: string, @Res() response: Response) {
    const result = await this.fileService.deleteFile(Number(id));

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
    });
  }

  @ApiOperation({ summary: 'Rename file' })
  @Patch('file/:id')
  async renameFile(
    @Param('id') id: string,
    @Body() dto: RenameFileDto,
    @Res() response: Response,
  ) {
    const result = await this.fileService.renameFile(Number(id), dto.name);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
    });
  }
}
