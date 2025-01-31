import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateClientDto } from './dto/update-client.dto';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';

@Injectable()
export class ClientService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(claims: JwtClaims, createClientDto: CreateClientDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        Email: createClientDto.Email,
      },
    });

    if (existingUser) {
      return new ErrorResult(
        Status.BadRequest,
        'A user with this email already exists.',
      );
    }

    const existingClient = await this.prismaService.client.findFirst({
      where: {
        Document: createClientDto.Document,
      },
    });

    if (existingClient) {
      return new ErrorResult(
        Status.BadRequest,
        'A client with the provided document already exists.',
      );
    }

    const { Name, Email, Phone, Document } = createClientDto;

    const defaultPassword = 'Archie$123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const sanitizedEmail = Email.toLowerCase();
    const sanitizedDocument = Document.replace(/[^0-9]/g, '');
    const sanitizedPhone = Phone.replace(/[^0-9]/g, '');

    const CLIENT_TYPE_ID = 4;
    const user = await this.prismaService.user.create({
      data: {
        Name,
        Email: sanitizedEmail,
        Phone: sanitizedPhone,
        Password: hashedPassword,
        UserTypeId: CLIENT_TYPE_ID,
        Document: sanitizedDocument,
        DocumentType: 'CPF',
        IsActive: true,
        ParentId: claims.OwnerId,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      },
    });

    const dto: Prisma.ClientUncheckedCreateInput = {
      Name,
      Email: sanitizedEmail,
      Phone: sanitizedPhone,
      Document: sanitizedDocument,
      DocumentType: 'CPF',
      UserId: user.Id,
      OwnerId: claims.OwnerId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const client = await this.prismaService.client.create({ data: dto });

    return new OkResult('Client has been successfully created.', client);
  }

  async findAllByOwner(
    claims: JwtClaims,
    take: number,
    skip: number,
    query?: string,
  ) {
    const ownerId = claims?.OwnerId;

    const whereQuery: Prisma.ClientWhereInput = {
      OwnerId: ownerId,
      DeletedAt: null,
    };

    if (query) {
      whereQuery.OR = [
        {
          Name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          Email: {
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

    const [clients, total] = await this.prismaService.$transaction([
      this.prismaService.client.findMany({
        where: whereQuery,
        orderBy: { Id: 'asc' },
        skip,
        take,
        include: {
          Project: {
            where: {
              DeletedAt: null,
            },
            select: {
              Id: true,
              Name: true,
            },
          },
          User: {
            select: {
              Session: {
                where: {
                  DeletedAt: null,
                },
                take: 1,
                orderBy: {
                  CreatedAt: 'desc',
                },
              },
            },
          },
        },
      }),
      this.prismaService.client.count({
        where: {
          OwnerId: ownerId,
          DeletedAt: null,
        },
      }),
    ]);

    const mappedClients = clients.map((client) => {
      const lastAccess = client.User?.Session[0]?.CreatedAt ?? null;

      const { User, ...rest } = client;
      return {
        ...rest,
        LastSession: lastAccess,
      };
    });

    const msg =
      clients.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available clients.';

    return new PaginatedResult(
      msg,
      mappedClients,
      total,
      calculateTotalPages(take, total),
    );
  }

  async findOne(id: number) {
    const client = await this.prismaService.client.findUnique({
      where: { Id: id },
    });

    if (!client) {
      return new ErrorResult(Status.NotFound, 'Client not found.');
    }

    return new OkResult('Client found.', client);
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.prismaService.client.findUnique({
      where: { Id: id },
    });

    if (!client) {
      return new ErrorResult(Status.NotFound, 'Client not found.');
    }

    if (updateClientDto.Email) {
      const existingUser = await this.prismaService.user.findFirst({
        where: {
          Email: updateClientDto.Email,
          Id: {
            not: client.UserId,
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

    if (updateClientDto.Document) {
      const existingClient = await this.prismaService.client.findFirst({
        where: {
          Document: updateClientDto.Document,
          Id: {
            not: client.Id,
          },
        },
      });

      if (existingClient) {
        return new ErrorResult(
          Status.BadRequest,
          'A client with the provided document already exists.',
        );
      }
    }

    const { Name, Email, Phone, Document } = updateClientDto;

    const dto: Prisma.ClientUncheckedUpdateInput = {
      Name,
      ...(Email && { Email: Email.toLowerCase() }),
      ...(Document && { Document: Document.replace(/[^0-9]/g, '') }),
      ...(Phone && { Phone: Phone.replace(/[^0-9]/g, '') }),
      UpdatedAt: new Date(),
    };

    await this.prismaService.user.update({
      where: { Id: client.UserId },
      data: { ...dto },
    });

    const updatedClient = await this.prismaService.client.update({
      where: { Id: id },
      data: { ...dto },
    });

    return new OkResult('Client has been successfully updated.', updatedClient);
  }

  async remove(id: number) {
    const existingClient = await this.prismaService.client.findUnique({
      where: { Id: id },
    });

    if (!existingClient) {
      return new ErrorResult(Status.NotFound, 'Client not found.');
    }

    await this.prismaService.user.update({
      where: { Id: existingClient.UserId },
      data: { DeletedAt: new Date(), IsActive: false },
    });

    const deletedClient = await this.prismaService.client.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Client has been successfully deleted.', deletedClient);
  }
}
