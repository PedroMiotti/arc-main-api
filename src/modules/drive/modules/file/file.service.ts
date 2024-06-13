import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UploadFileDto } from '../../dto/upload-file.dto';
import { ServerDependency } from 'src/config/server/dependencies';
import { BlobStorage } from 'src/shared/services/blob/blob-storage.interface';
import { ErrorResult, OkResult } from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { parse } from 'path';
import { Prisma } from '@prisma/client';
import { JwtClaims } from 'src/shared/http/jwt.decorator';

@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,

    @Inject(ServerDependency.BlobStorage)
    private readonly fileStorageService: BlobStorage,
  ) {}

  async uploadFile(claims: JwtClaims, file: UploadFileDto) {
    const { File, FolderId, ProjectId } = file;

    if (File.size == 0)
      return new ErrorResult(Status.InvalidOperation, 'File buffer is empty.');

    const uploadResult = await this.fileStorageService.upload({
      data: File.buffer,
      contentType: File.mimetype,
    });

    if (!uploadResult.ok || uploadResult.data === null)
      return new ErrorResult(uploadResult.status, uploadResult.message);

    const parsedFilepath = parse(File.originalname);

    const dto: Prisma.FileUncheckedCreateInput = {
      Name: parsedFilepath.name,
      Extension: parsedFilepath.ext,
      MimeType: File?.mimetype ?? '',
      Url: uploadResult.data.url,
      Size: File.size,
      ...(FolderId && { FolderId }),
      ...(ProjectId && { ProjectId }),
      IsVisibleToClient: true,
      UploadedBy: claims.Id,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const createdFile = await this.prismaService.file.create({
      data: dto,
    });

    const { Size , ...rest } = createdFile;

    return new OkResult('File uploaded successfully.', rest);
  }

  async moveFile(id: number, destinationFolderId: number) {
    const file = await this.prismaService.file.findUnique({
      where: { Id: id },
    });

    if (!file) return new ErrorResult(Status.NotFound, 'File not found.');

    await this.prismaService.file.update({
      where: { Id: id },
      data: { FolderId: destinationFolderId },
    });

    return new OkResult('File moved successfully.', null);
  }

  async deleteFile(id: number) {
    const file = await this.prismaService.file.findUnique({
      where: { Id: id },
    });

    if (!file) return new ErrorResult(Status.NotFound, 'File not found.');

    // TODO - Delete file from storage
    await this.prismaService.file.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('File deleted successfully.', null);
  }

  async renameFile(id: number, name: string) {
    const file = await this.prismaService.file.findUnique({
      where: { Id: id },
    });

    if (!file) return new ErrorResult(Status.NotFound, 'File not found.');

    await this.prismaService.file.update({
      where: { Id: id },
      data: { Name: name },
    });

    return new OkResult('File renamed successfully.', null);
  }
}
