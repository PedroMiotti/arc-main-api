import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateFolderDto } from '../../dto/create-folder.dto';
import { UpdateFolderDto } from '../../dto/update-folder';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import { ErrorResult, OkResult } from 'src/shared/result/result.interface';
import { Prisma } from '@prisma/client';
import { Status } from 'src/shared/result/status.enum';

@Injectable()
export class FolderService {
  constructor(private readonly prismaService: PrismaService) {}

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
      where: { Id: id },
      include: { File: true, ChildFolder: true },
    });

    if (!folder) throw new ErrorResult(Status.NotFound, 'Folder not found.');

    await this.prismaService.file.updateMany({
      where: { FolderId: id },
      data: { DeletedAt: new Date() },
    });

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
        },
      }),
      this.prismaService.file.findMany({
        where: {
          ProjectId: projectId,
          FolderId: isRootFolder ? null : folderId,
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
        },
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
}
