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
    const { Name, Tag, ActivePhaseId, CategoryId, LeaderId, ClientId } =
      createProjectDto;

    if (claim.UserTypeId === 1) {
      return new ErrorResult(
        Status.BadRequest,
        'An admin user cannot create a project. A project has to belong to a user of type 2 (Owner) or 3 (Member).',
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

    if (ActivePhaseId) {
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
    }

    const existingClient = await this.prismaService.client.findUnique({
      where: {
        Id: ClientId,
      },
    });

    if (!existingClient) {
      return new ErrorResult(
        Status.NotFound,
        'Could not find any client with provided ID.',
      );
    }

    const isClientSameOwner = existingClient.OwnerId === claim.OwnerId;

    if (!isClientSameOwner) {
      return new ErrorResult(
        Status.InvalidOperation,
        'The client and the project does not belong in the same organization.',
      );
    }

    const project = await this.prismaService.project.create({
      data: {
        Name,
        Tag,
        ...(ActivePhaseId && { ActivePhaseId }),
        CategoryId,
        LeaderId: claim.Id,
        ClientId,
        CreatedBy: claim.Id,
        OwnerId: claim.OwnerId,
        StartAt: new Date(createProjectDto.StartAt),
        ...(createProjectDto.EndAt && {
          EndAt: new Date(createProjectDto.EndAt),
        }),
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      } as Prisma.ProjectUncheckedCreateInput,
    });

    await this.prismaService.userProject.create({
      data: {
        UserId: claim.Id,
        ProjectId: project.Id,
        IsFavorite: false,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });

    return new OkResult('Project created successfully.', project);
  }

  async findOne(id: number) {
    const project = await this.prismaService.project.findUnique({
      where: {
        Id: id,
      },
    });

    if (!project) {
      return new ErrorResult(Status.NotFound, 'Project not found.');
    }

    return new OkResult('Project found.', project);
  }

  async update(
    claims: JwtClaims,
    id: number,
    updateProjectDto: UpdateProjectDto,
  ) {
    const ownerId = claims?.OwnerId;

    const project = await this.prismaService.project.findUnique({
      where: {
        Id: id,
      },
    });

    if (!project) {
      return new ErrorResult(Status.NotFound, 'Project not found.');
    }

    const isSameOwner = project.OwnerId === ownerId;

    if (!isSameOwner) {
      return new ErrorResult(
        Status.InvalidOperation,
        'The project and the user does not belong in the same organization.',
      );
    }

    const { Name, Tag, ActivePhaseId, CategoryId, LeaderId } = updateProjectDto;

    if (LeaderId) {
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
    }

    if (CategoryId) {
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
    }

    if (ActivePhaseId) {
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
    }

    const updatedProject = await this.prismaService.project.update({
      where: {
        Id: id,
      },
      data: {
        Name,
        Tag,
        ...(ActivePhaseId && { ActivePhaseId }),
        ...(CategoryId && { CategoryId }),
        ...(LeaderId && { LeaderId }),
        UpdatedAt: new Date(),
      },
    });

    return new OkResult('Project updated successfully.', updatedProject);
  }

  async remove(claims: JwtClaims, id: number) {
    const ownerId = claims?.OwnerId;

    const project = await this.prismaService.project.findUnique({
      where: {
        Id: id,
      },
    });

    if (!project) {
      return new ErrorResult(Status.NotFound, 'Project not found.');
    }

    const isSameOwner = project.OwnerId === ownerId;

    if (!isSameOwner) {
      return new ErrorResult(
        Status.InvalidOperation,
        'The project and the user does not belong in the same organization.',
      );
    }

    const deletedProject = await this.prismaService.project.update({
      where: {
        Id: id,
      },
      data: {
        DeletedAt: new Date(),
      },
    });

    return new OkResult('Project deleted successfully.', deletedProject);
  }

  async findAllUserProjects(claims: JwtClaims, take: number, skip: number) {
    const userId = claims?.Id;

    const whereQuery: Prisma.ProjectWhereInput = {
      DeletedAt: null,
      UserProject: {
        some: {
          UserId: userId,
        },
      },
    };

    const [projects, total] = await this.prismaService.$transaction([
      this.prismaService.project.findMany({
        where: whereQuery,
        orderBy: { Id: 'asc' },
        skip,
        take,
        include: {
          ProjectCategory: true,
          ProjectLeader: true,
          ProjectCreator: true,
          Client: true,
          ProjectPhase: true,
          UserProject: {
            select: {
              IsFavorite: true,
            },
          },
        },
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

  async assignUserToProject(
    claims: JwtClaims,
    userId: number,
    projectId: number,
  ) {
    const ownerId = claims?.OwnerId;

    const project = await this.prismaService.project.findUnique({
      where: {
        Id: projectId,
      },
    });

    if (!project) {
      return new ErrorResult(Status.NotFound, 'Project not found.');
    }

    const isSameOwner = project.OwnerId === ownerId;

    if (!isSameOwner) {
      return new ErrorResult(
        Status.InvalidOperation,
        'The project and the user does not belong in the same organization.',
      );
    }

    await this.prismaService.userProject.create({
      data: {
        UserId: userId,
        ProjectId: projectId,
        IsFavorite: false,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });

    return new OkResult('User assigned to project successfully.', null);
  }

  async toggleFavoriteProject(
    claims: JwtClaims,
    projectId: number,
    action: 'Favorite' | 'Unfavorite',
  ) {
    const userId = claims?.Id;

    const userProject = await this.prismaService.userProject.findFirst({
      where: {
        UserId: userId,
        ProjectId: projectId,
      },
    });

    if (!userProject) {
      return new ErrorResult(
        Status.NotFound,
        'The user is not have a relation with the project.',
      );
    }

    await this.prismaService.userProject.update({
      where: {
        Id: userProject.Id,
      },
      data: {
        IsFavorite: action === 'Favorite' ? true : false,
        UpdatedAt: new Date(),
      },
    });

    return new OkResult('Project favored successfully.', null);
  }

  async findAllCategories() {
    const categories = await this.prismaService.projectCategory.findMany();

    return new OkResult('Categories found.', categories);
  }

  async findAllMembers(id: number) {
    const members = await this.prismaService.user.findMany({
      where: {
        UserProject: {
          some: {
            ProjectId: id,
          },
        },
      },
    });

    return new OkResult('Members found.', members);
  }
}
