import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { Prisma } from '@prisma/client';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(claim: JwtClaims, createProjectDto: CreateProjectDto) {
    const { Name, Tag, ActivePhaseId, CategoryId, LeaderId } = createProjectDto;

    if (claim.UserTypeId === 1) {
      return new ErrorResult(
        Status.BadRequest,
        'An admin user cannot create a project. A project has to belong to a user of type 2.',
      );
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        Id: LeaderId,
      },
    });

    if (!existingUser) {
      return new ErrorResult(
        Status.NotFound,
        'Could not find any user with provided ID.',
      );
    }

    const existingCategory =
      await this.prismaService.projectCategory.findUnique({
        where: {
          Id: CategoryId,
        },
      });

    if (!existingCategory) {
      return new ErrorResult(
        Status.NotFound,
        'Could not find any category with provided ID.',
      );
    }

    const existingPhase = await this.prismaService.phase.findUnique({
      where: {
        Id: ActivePhaseId,
      },
    });

    if (!existingPhase) {
      return new ErrorResult(
        Status.NotFound,
        'Could not find any phase with provided ID.',
      );
    }

    const project = await this.prismaService.project.create({
      data: {
        Name,
        Tag,
        ActivePhaseId,
        CategoryId,
        LeaderId,
        CreatedBy: claim.Id,
        OwnerId: claim.OwnerId,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      } as Prisma.ProjectUncheckedCreateInput,
    });

    return new OkResult('Project created successfully.', project);
  }

  async findAllUserProjects(claims: JwtClaims, take: number, skip: number) {
    const userId = claims?.Id;

    const whereQuery: Prisma.ProjectWhereInput = {
      OR: [
        {
          LeaderId: userId,
        },
        {
          OwnerId: userId,
        },
        {
          UserProject: {
            some: {
              UserId: userId,
            },
          },
        },
      ],
    };

    const [projects, total] = await this.prismaService.$transaction([
      this.prismaService.project.findMany({
        where: whereQuery,
        orderBy: { Id: 'asc' },
        skip,
        take,
      }),
      this.prismaService.project.count({
        where: whereQuery,
      }),
    ]);

    const msg =
      projects.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available projects.';

    return new PaginatedResult(
      msg,
      projects,
      total,
      calculateTotalPages(take, total),
    );
  }

  assignUserToProject() {}

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
