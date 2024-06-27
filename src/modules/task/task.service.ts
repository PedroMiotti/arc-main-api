import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { Prisma } from '@prisma/client';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';
import { Status } from 'src/shared/result/status.enum';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(claims: JwtClaims, createPhaseDto: CreateTaskDto) {
    const {
      Name,
      StatusId,
      Description,
      DescriptionHtml,
      PhaseId,
      ProjectId,
      StartAt,
      EndAt,
    } = createPhaseDto;

    if (PhaseId) {
      const phase = await this.prismaService.phase.findUnique({
        where: { Id: PhaseId },
        select: {
          Project: {
            select: {
              OwnerId: true,
            },
          },
        },
      });

      if (!phase) return new ErrorResult(Status.NotFound, 'Phase not found.');

      const isSameOwner = phase.Project.OwnerId === claims.OwnerId;
      if (!isSameOwner)
        return new ErrorResult(
          Status.Forbidden,
          'The selected phase does not belong to this Owner ID.',
        );
    }

    const dto: Prisma.TaskUncheckedCreateInput = {
      Name,
      ProjectId,
      StatusId,
      ...(Description && { Description }),
      ...(DescriptionHtml && { DescriptionHtml }),
      ...(PhaseId && { PhaseId }),
      ...(StartAt && { StartAt: new Date(StartAt) }),
      ...(EndAt && { EndAt: new Date(EndAt) }),
      CreatedBy: claims.OwnerId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const projectStatuses = await this.prismaService.boardStatus.findMany({
      where: {
        ProjectId: ProjectId,
      },
    });

    if (StatusId) {
      const status = projectStatuses.find((x) => x.Id === StatusId);

      if (!status)
        return new ErrorResult(
          Status.NotFound,
          'Status not found in the project.',
        );
    } else {
      const defaultStatus = projectStatuses.find(
        (x) => x.BoardStatusTypeId === 1,
      );

      if (!defaultStatus)
        return new ErrorResult(
          Status.NotFound,
          'Default status not found in the project.',
        );

      dto.StatusId = defaultStatus.Id;
    }

    const task = await this.prismaService.task.create({
      data: dto,
      include: {
        TaskAssignee: true,
        BoardStatus: true,
        TaskCreator: true,
      },
    });

    return new OkResult('Task has been successfully created.', task);
  }

  async findAllByPhase(phaseId: number, take: number, skip: number) {
    const [tasks, total] = await this.prismaService.$transaction([
      this.prismaService.task.findMany({
        where: {
          PhaseId: phaseId,
          DeletedAt: null,
        },
        orderBy: { CreatedAt: 'asc' },
        skip,
        take,
      }),
      this.prismaService.task.count({
        where: {
          PhaseId: phaseId,
          DeletedAt: null,
        },
      }),
    ]);

    const msg =
      tasks.length == 0
        ? 'Search result returned no objects.'
        : 'Search result returned successfully.';

    return new PaginatedResult(
      msg,
      tasks,
      total,
      calculateTotalPages(take, total),
    );
  }

  async findAllByProject(projectId: number, isBacklog: boolean) {
    const tasks = await this.prismaService.task.findMany({
      where: {
        ProjectId: projectId,
        DeletedAt: null,
        ...(isBacklog && { PhaseId: null }),
      },
      orderBy: { UpdatedAt: 'asc' },
      select: {
        Id: true,
        Name: true,
        Description: true,
        PhaseId: true,
        ProjectId: true,
        StartAt: true,
        EndAt: true,
        EstimatedTime: true,
        AssignTo: true,
        IsOnBoard: true,
        StatusId: true,
        DeletedAt: true,
        CreatedAt: true,
        UpdatedAt: true,
        TaskAssignee: true,
        TaskCreator: true,
        BoardStatus: {
          select: {
            Description: true,
            BoardStatusTypeId: true,
          },
        },
      },
    });

    const msg =
      tasks.length == 0
        ? 'Search result returned no objects.'
        : 'Search result returned successfully.';

    return new OkResult(msg, tasks);
  }

  async findOne(id: number) {
    const task = await this.prismaService.task.findUnique({
      where: { Id: id },
    });

    if (!task) return new ErrorResult(Status.NotFound, 'Task not found.');

    return new OkResult('Task has been successfully retrieved.', task);
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const {
      Name,
      StatusId,
      Description,
      DescriptionHtml,
      PhaseId,
      StartAt,
      EndAt,
      AssignTo,
    } = updateTaskDto;

    const dto: Prisma.TaskUncheckedUpdateInput = {
      ...(Name && { Name }),
      ...(StatusId && { StatusId }),
      ...(Description && { Description }),
      ...(DescriptionHtml && { DescriptionHtml }),
      ...(PhaseId === null ? { PhaseId: null } : { PhaseId }),
      ...(StartAt && { StartAt: new Date(StartAt) }),
      ...(EndAt && { EndAt: new Date(EndAt) }),
      UpdatedAt: new Date(),
    };

    if (AssignTo) {
      const task = await this.prismaService.task.findUnique({
        where: { Id: id },
      });

      const user = await this.prismaService.user.findUnique({
        where: { Id: AssignTo },
        include: { UserProject: true },
      });

      if (!user) return new ErrorResult(Status.NotFound, 'User not found.');

      const isProjectMember = user.UserProject.find(
        (x) => x.ProjectId === task.ProjectId,
      );

      if (!isProjectMember)
        return new ErrorResult(
          Status.Forbidden,
          'The selected user is not a member of the project.',
        );

      dto.AssignTo = AssignTo;
    }

    if (PhaseId) {
      const phase = await this.prismaService.phase.findUnique({
        where: { Id: PhaseId },
      });

      const activePhases = await this.prismaService.phase.findMany({
        where: {
          ProjectId: phase.ProjectId,
          IsActive: true,
          DeletedAt: null,
        },
      });

      if (!phase) return new ErrorResult(Status.NotFound, 'Phase not found.');

      const isActivePhase = activePhases.find((x) => x.Id === PhaseId)
        ? true
        : false;

      dto.IsOnBoard = isActivePhase;
    }

    const task = await this.prismaService.task.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult('Task has been successfully updated.', task);
  }

  async remove(id: number) {
    const task = await this.prismaService.task.findUnique({
      where: { Id: id },
    });

    if (!task) return new ErrorResult(Status.NotFound, 'Task not found.');

    const deletedTask = await this.prismaService.task.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Task has been successfully deleted.', deletedTask);
  }
}
