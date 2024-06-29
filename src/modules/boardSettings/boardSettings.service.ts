import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ErrorResult, OkResult } from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class BoardSettingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createStatus(createStatusDto: CreateStatusDto) {
    const { Description, BoardStatusTypeId, ProjectId } = createStatusDto;

    const existingStatus = await this.prismaService.boardStatus.findFirst({
      where: {
        Description,
        ProjectId,
        DeletedAt: null,
      },
    });

    if (existingStatus) {
      return new ErrorResult(
        Status.BadRequest,
        'A status with the provided description already exists.',
      );
    }

    const dto: Prisma.BoardStatusUncheckedCreateInput = {
      Description,
      BoardStatusTypeId,
      ProjectId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const status = await this.prismaService.boardStatus.create({ data: dto });

    return new OkResult('Board status has been successfully created.', status);
  }

  async updateStatus(id: number, updatedBoardStatusDto: UpdateStatusDto) {
    const { Description, BoardStatusTypeId, BoardColumnId } =
      updatedBoardStatusDto;

    const boardStatus = await this.prismaService.boardStatus.findFirst({
      where: {
        Id: id,
      },
    });

    if (boardStatus) {
      return new ErrorResult(Status.BadRequest, 'Board status not found.');
    }

    if (Description) {
      const existingStatus = await this.prismaService.boardStatus.findFirst({
        where: {
          Description,
          ProjectId: boardStatus.ProjectId,
          DeletedAt: null,
        },
      });

      if (existingStatus) {
        return new ErrorResult(
          Status.BadRequest,
          'A status with the provided description already exists.',
        );
      }
    }

    if (BoardColumnId) {
      const existingColumn = await this.prismaService.boardColumns.findFirst({
        where: {
          Id: BoardColumnId,
          ProjectId: boardStatus.ProjectId,
          DeletedAt: null,
        },
      });

      if (!existingColumn) {
        return new ErrorResult(Status.BadRequest, 'Board column not found.');
      }
    }

    const dto: Prisma.BoardStatusUncheckedUpdateInput = {
      ...(Description && { Description }),
      ...(BoardStatusTypeId && { BoardStatusTypeId }),
      ...(BoardColumnId && { BoardColumnId }),
      UpdatedAt: new Date(),
    };

    const status = await this.prismaService.boardStatus.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult('Board status has been successfully updated.', status);
  }

  async deleteStatus(id: number) {
    const existingStatus = await this.prismaService.boardStatus.findFirst({
      where: { Id: id },
    });

    if (!existingStatus) {
      return new ErrorResult(Status.NotFound, 'Board status not found.');
    }

    await this.prismaService.boardStatus.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Board status has been successfully removed.', {});
  }

  async getProjectStatuses(projectId: number) {
    const statuses = await this.prismaService.boardStatus.findMany({
      where: {
        ProjectId: projectId,
        DeletedAt: null,
      },
    });

    return new OkResult('Board statuses found.', statuses);
  }

  async getProjectColumns(projectId: number) {
    const columns = await this.prismaService.boardColumns.findMany({
      where: {
        ProjectId: projectId,
        DeletedAt: null,
      },
      include: {
        BoardStatus: true,
      },
    });

    return new OkResult('Board columns found.', columns);
  }

  async createColumn(createColumnDto: CreateColumnDto) {
    const { Description, ProjectId, Position } = createColumnDto;

    const existingColumn = await this.prismaService.boardColumns.findFirst({
      where: {
        Description,
        ProjectId,
        DeletedAt: null,
      },
    });

    if (existingColumn) {
      return new ErrorResult(
        Status.BadRequest,
        'A column with the provided description already exists.',
      );
    }

    const dto: Prisma.BoardColumnsUncheckedCreateInput = {
      Description,
      ProjectId,
      Position,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const column = await this.prismaService.boardColumns.create({ data: dto });

    return new OkResult('Board column has been successfully created.', column);
  }

  async updateColumn(id: number, updatedColumnDto: UpdateColumnDto) {
    const { Description, Position } = updatedColumnDto;

    const column = await this.prismaService.boardColumns.findFirst({
      where: {
        Id: id,
      },
    });

    if (!column) {
      return new ErrorResult(Status.BadRequest, 'Board column not found.');
    }

    if (Description) {
      const existingColumn = await this.prismaService.boardColumns.findFirst({
        where: {
          Description,
          ProjectId: column.ProjectId,
          DeletedAt: null,
        },
      });

      if (existingColumn) {
        return new ErrorResult(
          Status.BadRequest,
          'A column with the provided description already exists.',
        );
      }
    }

    const dto: Prisma.BoardColumnsUncheckedUpdateInput = {
      ...(Description && { Description }),
      ...(Position && { Position }),
      UpdatedAt: new Date(),
    };

    const updatedColumn = await this.prismaService.boardColumns.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult(
      'Board column has been successfully updated.',
      updatedColumn,
    );
  }

  async deleteColumn(id: number) {
    const existingColumn = await this.prismaService.boardColumns.findFirst({
      where: { Id: id },
    });

    if (!existingColumn) {
      return new ErrorResult(Status.NotFound, 'Board column not found.');
    }

    await this.prismaService.boardColumns.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Board column has been successfully removed.', {});
  }
}
