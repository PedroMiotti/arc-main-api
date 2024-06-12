import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhaseService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(claims: JwtClaims, createPhaseDto: CreatePhaseDto) {
    const { Description, ProjectId, StartDate, EndDate, ColorId } =
      createPhaseDto;

    const dto: Prisma.PhaseUncheckedCreateInput = {
      Description,
      ProjectId,
      ColorId,
      ...(StartDate && { StartAt: new Date(StartDate) }),
      ...(EndDate && { EndAt: new Date(EndDate) }),
      CreatedBy: claims.OwnerId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const client = await this.prismaService.phase.create({ data: dto });

    return new OkResult('Phase has been successfully created.', client);
  }

  async initialize(id: number) {
    const phase = await this.prismaService.phase.findUnique({
      where: { Id: id },
    });

    if (!phase) return new ErrorResult(Status.NotFound, 'Phase not found.');

    const activePhases = await this.prismaService.phase.findMany({
      where: { ProjectId: phase.ProjectId, IsActive: true, DeletedAt: null },
    });

    const isActivePhase = activePhases.find((x) => x.Id === id) ? true : false;

    if (isActivePhase) {
      return new ErrorResult(
        Status.BadRequest,
        'Phase is already active. Cannot be initialized.',
      );
    }

    const [updatedPhase] = await this.prismaService.$transaction([
      this.prismaService.phase.update({
        where: { Id: id },
        data: { IsActive: true },
      }),
      this.prismaService.task.updateMany({
        where: { PhaseId: id },
        data: { IsOnBoard: true },
      }),
    ]);

    return new OkResult(
      'Phase has been successfully initialized.',
      updatedPhase,
    );
  }

  async findAllByProjectId(projectId: number, take: number, skip: number) {
    const [phases, total] = await this.prismaService.$transaction([
      this.prismaService.phase.findMany({
        where: {
          ProjectId: projectId,
          DeletedAt: null,
        },
        orderBy: { CreatedAt: 'asc' },
        skip,
        take,
      }),
      this.prismaService.phase.count({
        where: {
          ProjectId: projectId,
          DeletedAt: null,
        },
      }),
    ]);

    const msg =
      phases.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available phases.';

    return new PaginatedResult(
      msg,
      phases,
      total,
      calculateTotalPages(take, total),
    );
  }

  async findOne(id: number) {
    const phase = await this.prismaService.phase.findUnique({
      where: { Id: id },
    });

    if (!phase) {
      return new ErrorResult(Status.NotFound, 'Phase not found.');
    }

    return new OkResult('Phase found.', phase);
  }

  async update(id: number, updatePhaseDto: UpdatePhaseDto) {
    const phase = await this.prismaService.phase.findUnique({
      where: { Id: id },
    });

    if (!phase) {
      return new ErrorResult(Status.NotFound, 'Phase not found.');
    }

    const { Description, StartDate, EndDate, ColorId } = updatePhaseDto;

    const dto: Prisma.PhaseUncheckedUpdateInput = {
      ...(Description && { Description }),
      ...(ColorId && { ColorId }),
      ...(StartDate && { StartAt: new Date(StartDate) }),
      ...(EndDate && { EndAt: new Date(EndDate) }),
      UpdatedAt: new Date(),
    };

    const updatedPhase = await this.prismaService.phase.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult('Phase has been successfully updated.', updatedPhase);
  }

  async remove(id: number) {
    const phase = await this.prismaService.phase.findUnique({
      where: { Id: id },
    });

    if (!phase) {
      return new ErrorResult(Status.NotFound, 'Phase not found.');
    }

    const [deletedPhase] = await this.prismaService.$transaction([
      this.prismaService.phase.update({
        where: { Id: id },
        data: { DeletedAt: new Date() },
      }),
      this.prismaService.task.updateMany({
        where: { PhaseId: id },
        data: { PhaseId: null },
      }),
    ]);

    return new OkResult('Phase has been successfully deleted.', deletedPhase);
  }
}
