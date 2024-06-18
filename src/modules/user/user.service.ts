import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import { Status } from 'src/shared/result/status.enum';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto, claims: JwtClaims) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        Email: createUserDto.Email,
      },
    });

    if (existingUser) {
      return new ErrorResult(
        Status.BadRequest,
        'A user with this email already exists.',
      );
    }

    if (createUserDto.RoleId) {
      const existingRole = await this.prismaService.role.findUnique({
        where: {
          Id: createUserDto.RoleId,
        },
      });

      if (!existingRole) {
        return new ErrorResult(Status.BadRequest, 'Role not found.');
      }
    }

    const {
      Name,
      Document,
      DocumentType,
      Email,
      InvitationStatusId,
      IsActive,
      Password,
      Phone,
      RoleId,
      UserTypeId,
    } = createUserDto;

    const isFirstRegister = !claims;

    let hashedPassword = '';
    if (Password && isFirstRegister) {
      hashedPassword = await bcrypt.hash(Password, 10);
    } else {
      const defaultPassword = 'Archie$123';
      hashedPassword = await bcrypt.hash(defaultPassword, 10);
    }

    const dto: Prisma.UserUncheckedCreateInput = {
      Name,
      Document,
      DocumentType,
      Email,
      InvitationStatusId: InvitationStatusId ?? 1,
      IsActive: IsActive ?? true,
      Password: hashedPassword,
      Phone,
      RoleId,
      UserTypeId: UserTypeId ?? 3,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    if (isFirstRegister) {
      dto.InvitationStatusId = 3;
      dto.IsMaster = true;
      dto.ParentId = null;
      dto.UserTypeId = 2;
    } else {
      dto.ParentId = claims?.OwnerId;
      dto.IsMaster = false;
    }

    const user = await this.prismaService.user.create({
      data: { ...dto },
    });

    const { Password: _, ...userWithoutPassword } = user;

    return new OkResult(
      'User has been successfully created.',
      userWithoutPassword,
    );
  }

  async findAllByOwner(claims: JwtClaims, take: number, skip: number) {
    const ownerId = claims?.OwnerId;

    const [users, total] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: {
          OR: [{ ParentId: ownerId }, { Id: ownerId }],
          UserTypeId: { in: [2, 3] },
          DeletedAt: null,
        },
        orderBy: { Id: 'asc' },
        skip,
        take,
        select: {
          Id: true,
          Name: true,
          Document: true,
          DocumentType: true,
          Email: true,
          Phone: true,
          IsActive: true,
          IsMaster: true,
          ParentId: true,
          RoleId: true,
          InvitationStatusId: true,
          CreatedAt: true,
          UpdatedAt: true,
          Role: {
            select: {
              Name: true,
            },
          },
          UserTypeId: true,
        },
      }),
      this.prismaService.user.count({
        where: {
          OR: [{ ParentId: ownerId }, { Id: ownerId }],
          UserTypeId: { in: [2, 3] },
          DeletedAt: null,
        },
      }),
    ]);

    const msg =
      users.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available users.';

    return new PaginatedResult(
      msg,
      users,
      total,
      calculateTotalPages(take, total),
    );
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { Id: id },
      select: {
        Id: true,
        Name: true,
        Document: true,
        DocumentType: true,
        Email: true,
        Phone: true,
        IsActive: true,
        IsMaster: true,
        ParentId: true,
        RoleId: true,
        InvitationStatusId: true,
        CreatedAt: true,
        UpdatedAt: true,
        Role: {
          select: {
            Name: true,
          },
        },
        UserTypeId: true,
      },
    });

    if (!user) {
      return new ErrorResult(Status.NotFound, 'User not found.');
    }

    return new OkResult('User found.', user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { Id: id },
    });

    if (!user) {
      return new ErrorResult(Status.NotFound, 'User not found.');
    }

    if (updateUserDto.RoleId) {
      const existingRole = await this.prismaService.role.findUnique({
        where: {
          Id: updateUserDto.RoleId,
        },
      });

      if (!existingRole) {
        return new ErrorResult(Status.BadRequest, 'Role not found.');
      }
    }

    if (updateUserDto.Email) {
      const existingUser = await this.prismaService.user.findFirst({
        where: {
          Email: updateUserDto.Email,
          Id: {
            not: id,
          },
        },
      });

      if (existingUser) {
        return new ErrorResult(
          Status.BadRequest,
          'A user with this email already exists.',
        );
      }
    }

    const {
      Name,
      Document,
      DocumentType,
      Email,
      InvitationStatusId,
      IsActive,
      Phone,
      RoleId,
      UserTypeId,
    } = updateUserDto;

    const dto: Prisma.UserUncheckedUpdateInput = {
      Name,
      Document,
      DocumentType,
      Email,
      InvitationStatusId,
      IsActive,
      Phone,
      RoleId,
      UserTypeId,
      UpdatedAt: new Date(),
    };

    const updatedUser = await this.prismaService.user.update({
      where: { Id: id },
      data: { ...dto },
    });

    return new OkResult('User has been successfully updated.', updatedUser);
  }

  async remove(id: number) {
    const deletedUser = await this.prismaService.user.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('User has been successfully deleted.', deletedUser);
  }
}
