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
      UserTypeId: UserTypeId ?? 2,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    if (isFirstRegister) {
      dto.InvitationStatusId = 3;
      dto.IsMaster = true;
      dto.ParentId = null;
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
          ParentId: ownerId,
        },
        orderBy: { Id: 'asc' },
        skip,
        take,
      }),
      this.prismaService.user.count({ where: { ParentId: ownerId } }),
    ]);

    const msg =
      users.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available clients.';

    return new PaginatedResult(
      msg,
      users,
      total,
      calculateTotalPages(take, total),
    );
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
