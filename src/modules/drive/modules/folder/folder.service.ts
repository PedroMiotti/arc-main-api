import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateFolderDto } from '../../dto/create-folder.dto';
import { UpdateFolderDto } from '../../dto/update-folder';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import { ErrorResult, OkResult } from 'src/shared/result/result.interface';
import { Prisma } from '@prisma/client';
import { Status } from 'src/shared/result/status.enum';
import { ServerDependency } from 'src/config/server/dependencies';
import { BlobStorage } from 'src/shared/services/blob/blob-storage.interface';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class FolderService {
  constructor(
    private readonly prismaService: PrismaService,

    @Inject(ServerDependency.BlobStorage)
    private readonly fileStorageService: BlobStorage,
  ) {}

  async createFolder(claim: JwtClaims, folder: CreateFolderDto) {
    const { Name, ParentId, ProjectId } = folder;
    const { Id } = claim;

    const dto: Prisma.FolderUncheckedCreateInput = {
      Name,
      ...(ParentId && { ParentId }),
      ...(ProjectId && { ProjectId }),
      CreatedBy: Id,
      IsVisibleToClient: true,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const result = await this.prismaService.folder.create({
      data: dto,
    });

    return new OkResult('Project created successfully.', result);
  }

  async deleteFolder(id: number) {
    const folder = await this.prismaService.folder.findUnique({
      where: { Id: id, DeletedAt: null },
      include: {
        File: {
          where: { DeletedAt: null },
        },
        ChildFolder: { where: { DeletedAt: null } },
      },
    });

    if (!folder) throw new ErrorResult(Status.NotFound, 'Folder not found.');

    await this.prismaService.file.updateMany({
      where: { FolderId: id },
      data: { DeletedAt: new Date() },
    });
    console.log(folder);

    for (const file of folder.File) {
      await this.fileStorageService.delete(file.Url);
    }

    for (const childFolder of folder.ChildFolder) {
      await this.deleteFolder(childFolder.Id);
    }

    await this.prismaService.folder.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Folder deleted successfully.', null);
  }

  async updateFolder(id: number, folder: UpdateFolderDto) {
    const { Name, ParentId } = folder;

    const dto: Prisma.FolderUncheckedUpdateInput = {
      ...(Name && { Name }),
      ...(ParentId && { ParentId }),
      UpdatedAt: new Date(),
    };

    const result = await this.prismaService.folder.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult('Folder updated successfully.', result);
  }

  async getFolderContent(id: number) {
    const folder = await this.prismaService.folder.findUnique({
      where: { Id: id },
      include: { File: true, ChildFolder: true },
    });

    if (!folder) throw new ErrorResult(Status.NotFound, 'Folder not found.');

    return new OkResult('Folder content retrieved successfully.', folder);
  }

  async getRootFolderForProject(projectId: number, folderId?: number) {
    const isRootFolder = !folderId;

    const [folders, files] = await this.prismaService.$transaction([
      this.prismaService.folder.findMany({
        where: {
          ProjectId: projectId,
          ParentId: isRootFolder ? null : folderId,
          DeletedAt: null,
        },
        orderBy: { UpdatedAt: 'asc' },
      }),
      this.prismaService.file.findMany({
        where: {
          ProjectId: projectId,
          FolderId: isRootFolder ? null : folderId,
          DeletedAt: null,
        },
        select: {
          Id: true,
          Name: true,
          MimeType: true,
          Extension: true,
          Url: true,
          IsVisibleToClient: true,
          UploadedBy: true,
          FolderId: true,
          ProjectId: true,
          CreatedAt: true,
          UpdatedAt: true,
          User: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
        orderBy: { UpdatedAt: 'asc' },
      }),
    ]);

    let folder = null;
    if (folderId) {
      folder = await this.prismaService.folder.findUnique({
        where: { Id: folderId },
        include: {
          ParentFolder: true,
        },
      });

      if (!folder) throw new ErrorResult(Status.NotFound, 'Folder not found.');
    }

    return new OkResult('Folder content retrieved successfully.', {
      folders,
      files,
      folder,
    });
  }

  async downloadFolder(folderId: number): Promise<StreamableFile> {
    const folder = await this.prismaService.folder.findUnique({
      where: { Id: folderId },
      include: {
        File: { where: { DeletedAt: null } },
        ChildFolder: {
          include: {
            File: { where: { DeletedAt: null } },
            ChildFolder: { where: { DeletedAt: null } },
          },
        },
      },
    });

    if (!folder) throw new ErrorResult(Status.NotFound, 'Folder not found.');

    const zipStream = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.pipe(zipStream);

    const addFilesToArchive = async (folder, parentPath = '') => {
      const folderPath = `${parentPath}${folder.Name}/`;

      for (const file of folder.File) {
        const downloadResult = await this.fileStorageService.download(file.Url);

        archive.append(downloadResult.data, {
          name: `${folderPath}${file.Name}${file.Extension}`,
        });
      }

      for (const childFolder of folder.ChildFolder) {
        await addFilesToArchive(childFolder, folderPath);
      }
    };

    await addFilesToArchive(folder);

    archive.finalize();

    return new StreamableFile(zipStream);
  }
}
