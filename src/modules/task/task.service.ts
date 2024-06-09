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
      PhaseId,
      ProjectId,
      StartDate,
      EndDate,
    } = createPhaseDto;

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

    const dto: Prisma.TaskUncheckedCreateInput = {
      Name,
      StatusId,
      Description,
      ProjectId,
      ...(PhaseId && { PhaseId }),
      ...(StartDate && { StartAt: new Date(StartDate) }),
      ...(EndDate && { EndAt: new Date(EndDate) }),
      CreatedBy: claims.OwnerId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const task = await this.prismaService.task.create({ data: dto });

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

  async findAllByProject(projectId: number) {
    const tasks = await this.prismaService.task.findMany({
      where: {
        ProjectId: projectId,
        DeletedAt: null,
      },
      orderBy: { UpdatedAt: 'asc' },
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
    const { Name, StatusId, Description, PhaseId, StartDate, EndDate } =
      updateTaskDto;

    const dto: Prisma.TaskUncheckedUpdateInput = {
      ...(Name && { Name }),
      ...(StatusId && { StatusId }),
      ...(Description && { Description }),
      ...(PhaseId && { PhaseId }),
      ...(StartDate && { StartAt: new Date(StartDate) }),
      ...(EndDate && { EndAt: new Date(EndDate) }),
      UpdatedAt: new Date(),
    };

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
