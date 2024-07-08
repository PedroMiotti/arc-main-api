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
    const { Name, Tag, CategoryId, LeaderId, ClientId } = createProjectDto;

    if (claim.UserTypeId === 1) {
      return new ErrorResult(
        Status.BadRequest,
        'An admin user cannot create a project. A project has to belong to a user of type 2 (Owner) or 3 (Member).',
      );
    }

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

    const defaultStatuses = [
      { description: 'Pendente', typeId: 1 },
      { description: 'Em andamento', typeId: 2 },
      { description: 'Concluído', typeId: 3 },
    ];

    for (const status of defaultStatuses) {
      const columnId = await this.prismaService.boardColumns.create({
        data: {
          Description: status.description,
          ProjectId: project.Id,
          Position: status.typeId,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        },
      });

      await this.prismaService.boardStatus.create({
        data: {
          ProjectId: project.Id,
          Description: status.description,
          BoardStatusTypeId: status.typeId,
          BoardColumnId: columnId.Id,
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        },
      });
    }

    return new OkResult('Project created successfully.', project);
  }

  async findOne(id: number) {
    const project = await this.prismaService.project.findUnique({
      where: {
        Id: id,
      },
      include: {
        ProjectCategory: true,
        Phase: {
          select: {
            Id: true,
            Title: true,
            IsActive: true,
            ConcludedAt: true,
            Color: {
              select: {
                Description: true,
                BackgroundColor: true,
                Color: true,
              },
            },
            Task: {
              select: {
                Id: true,
                Name: true,
                BoardStatus: true,
              },
            },
          },
          where: {
            DeletedAt: null,
          },
        },
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

    const { Name, Tag, CategoryId, LeaderId, EndAt, StartAt } = updateProjectDto;

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

    const updatedProject = await this.prismaService.project.update({
      where: {
        Id: id,
      },
      data: {
        Name,
        Tag,
        ...(CategoryId && { CategoryId }),
        ...(LeaderId && { LeaderId }),
        ...(StartAt && { StartAt: new Date(StartAt) }),
        ...(EndAt && { EndAt: new Date(EndAt) }),
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

  async findAllUserProjects(
    claims: JwtClaims,
    take: number,
    skip: number,
    query: string,
  ) {
    const userId = claims?.Id;

    const user = await this.prismaService.user.findUnique({
      where: {
        Id: userId,
      },
    });

    const isAdminOwner = user?.UserTypeId === 2;

    const whereQuery: Prisma.ProjectWhereInput = { DeletedAt: null };

    if (isAdminOwner) {
      whereQuery.OwnerId = claims.OwnerId;
    } else {
      whereQuery.UserProject = {
        some: {
          UserId: userId,
        },
      };
    }

    if (query) {
      whereQuery.OR = [
        {
          Name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          Tag: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];

      const isQueryNumber = !isNaN(parseInt(query, 10));
      if (isQueryNumber) {
        whereQuery.OR.push({
          Id: {
            equals: Number(query),
          },
        });
      }
    }

    // Temporary
    const isHome = take === 4;

    const [projects, total] = await this.prismaService.$transaction([
      this.prismaService.project.findMany({
        where: whereQuery,
        orderBy: !isHome ? { Id: 'asc' } : { UpdatedAt: 'desc' },
        skip,
        take,
        include: {
          ProjectCategory: true,
          ProjectLeader: true,
          ProjectCreator: true,
          Client: true,
          Phase: {
            select: {
              Id: true,
              Title: true,
              IsActive: true,
              Color: {
                select: {
                  Description: true,
                  BackgroundColor: true,
                  Color: true,
                },
              },
              Task: {
                select: {
                  Id: true,
                  BoardStatus: true,
                },
              },
            },
            where: {
              DeletedAt: null,
              IsActive: true,
            },
          },
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

  async findAllClientProjects(claims: JwtClaims, take: number, skip: number) {
    const userId = claims?.Id;

    const user = await this.prismaService.user.findUnique({
      where: {
        Id: userId,
      },
      select: {
        UserTypeId: true,
        ClientAccount: {
          select: {
            Id: true,
          },
        },
      },
    });

    const isClientUser = user?.UserTypeId === 4;

    if (!isClientUser || !user?.ClientAccount[0]?.Id) {
      return new ErrorResult(
        Status.InvalidOperation,
        'Only client users can view client projects.',
      );
    }

    const [projects, total] = await this.prismaService.$transaction([
      this.prismaService.project.findMany({
        where: { DeletedAt: null, ClientId: user?.ClientAccount[0]?.Id },
        orderBy: { UpdatedAt: 'asc' },
        skip,
        take,
        include: {
          ProjectCategory: true,
          Phase: {
            select: {
              Id: true,
              Title: true,
              IsActive: true,
              Color: {
                select: {
                  Description: true,
                  BackgroundColor: true,
                  Color: true,
                },
              },
              Task: {
                select: {
                  Id: true,
                  BoardStatus: true,
                },
              },
            },
            where: {
              DeletedAt: null,
            },
          },
        },
      }),
      this.prismaService.project.count({
        where: { DeletedAt: null, ClientId: user?.ClientAccount[0]?.Id },
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

  async findUserFavoriteProjects(claims: JwtClaims) {
    const userId = claims?.Id;

    const user = await this.prismaService.user.findUnique({
      where: {
        Id: userId,
      },
    });

    const isAdminOwner = user?.UserTypeId === 2;

    const whereQuery: Prisma.ProjectWhereInput = { DeletedAt: null };

    if (isAdminOwner) {
      whereQuery.OwnerId = claims.OwnerId;
      whereQuery.UserProject = {
        some: {
          IsFavorite: true,
        },
      };
    } else {
      whereQuery.UserProject = {
        some: {
          UserId: userId,
          IsFavorite: true,
        },
      };
    }

    const projects = await this.prismaService.project.findMany({
      where: whereQuery,
      orderBy: { UpdatedAt: 'asc' },
      include: {
        ProjectCategory: {
          select: {
            Description: true,
          },
        },
      },
    });

    return new OkResult('User favorite projects found.', projects);
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

  async removeUserFromProject(
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

    const userProject = await this.prismaService.userProject.findFirst({
      where: { UserId: userId, ProjectId: projectId },
    });

    if (!userProject) {
      return new ErrorResult(
        Status.NotFound,
        'This user does not belong to this project.',
      );
    }

    await this.prismaService.userProject.delete({
      where: {
        Id: userProject.Id,
      },
    });

    return new OkResult('User removed from project successfully.', null);
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

    return new OkResult(
      `Project ${action === 'Favorite' ? 'favored' : 'unfavored'} successfully.`,
      null,
    );
  }

  async findAllCategories() {
    const categories = await this.prismaService.projectCategory.findMany();

    return new OkResult('Categories found.', categories);
  }

  async findProjectMembers(projectId: number) {
    const project = await this.prismaService.project.findUnique({
      where: {
        Id: projectId,
      },
    });

    if (!project) return new ErrorResult(Status.NotFound, 'Project not found.');

    const members = await this.prismaService.userProject.findMany({
      where: {
        ProjectId: projectId,
      },
      include: {
        User: true,
      },
    });

    return new OkResult('Project members found.', members);
  }
}
