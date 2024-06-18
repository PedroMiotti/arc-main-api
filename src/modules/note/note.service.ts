import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import {
  ErrorResult,
  OkResult,
  PaginatedResult,
} from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { calculateTotalPages } from 'src/shared/pagination/pagination.util';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { UploadImageToNoteDto } from './dto/upload-image.dto';
import { ServerDependency } from 'src/config/server/dependencies';
import { BlobStorage } from 'src/shared/services/blob/blob-storage.interface';

@Injectable()
export class NoteService {
  constructor(
    private readonly prismaService: PrismaService,

    @Inject(ServerDependency.BlobStorage)
    private readonly fileStorageService: BlobStorage,
  ) {}

  async create(claims: JwtClaims, createNoteDto: CreateNoteDto) {
    const { Title, ProjectId } = createNoteDto;

    const dto: Prisma.NoteUncheckedCreateInput = {
      Title,
      ProjectId,
      CreatedBy: claims.Id,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const note = await this.prismaService.note.create({ data: dto });

    return new OkResult('Note has been successfully created.', note);
  }

  async findAllByProjectId(projectId: number, take: number, skip: number) {
    const [notes, total] = await this.prismaService.$transaction([
      this.prismaService.note.findMany({
        where: {
          ProjectId: projectId,
          DeletedAt: null,
        },
        select: {
          Id: true,
          Title: true,
          CreatedAt: true,
          UpdatedAt: true,
          CreatedBy: true,
          NoteCreator: true,
        },
        orderBy: { UpdatedAt: 'desc' },
        skip,
        take,
      }),
      this.prismaService.note.count({
        where: {
          ProjectId: projectId,
          DeletedAt: null,
        },
      }),
    ]);

    const msg =
      notes.length == 0
        ? 'Search result returned no objects.'
        : 'Listing available notes.';

    return new PaginatedResult(
      msg,
      notes,
      total,
      calculateTotalPages(take, total),
    );
  }

  async findOne(id: number) {
    const note = await this.prismaService.note.findUnique({
      where: { Id: id },
      include: {
        NoteCreator: {
          select: {
            Id: true,
            Name: true,
            Email: true,
          },
        },
        NoteLastEditor: {
          select: {
            Id: true,
            Name: true,
            Email: true,
          },
        },
      },
    });

    if (!note) return new ErrorResult(Status.NotFound, 'Note not found.');

    return new OkResult('Note found.', note);
  }

  async update(claims: JwtClaims, id: number, updateNoteDto: UpdateNoteDto) {
    const note = await this.prismaService.note.findUnique({
      where: { Id: id },
    });

    if (!note) return new ErrorResult(Status.NotFound, 'Note not found.');

    const { Title, Content } = updateNoteDto;

    const dto: Prisma.NoteUncheckedUpdateInput = {
      ...(Title && { Title }),
      ...(Content && { Content }),
      UpdatedBy: claims.Id,
      UpdatedAt: new Date(),
    };

    const updatedNote = await this.prismaService.note.update({
      where: { Id: id },
      data: dto,
    });

    return new OkResult('Note has been successfully updated.', updatedNote);
  }

  async remove(id: number) {
    const note = await this.prismaService.note.findUnique({
      where: { Id: id },
    });

    if (!note) return new ErrorResult(Status.NotFound, 'Note not found.');

    const deletedNote = await this.prismaService.note.update({
      where: { Id: id },
      data: { DeletedAt: new Date() },
    });

    return new OkResult('Note has been successfully deleted.', deletedNote);
  }

  async uploadImageToNote(id: number, uploadImageDto: UploadImageToNoteDto) {
    const { BlockId, Image } = uploadImageDto;

    const uploadResult = await this.fileStorageService.uploadBase64(Image);

    if (!uploadResult.ok || uploadResult.data === null)
      return new ErrorResult(uploadResult.status, uploadResult.message);

    const dto: Prisma.NoteImageUncheckedCreateInput = {
      NoteId: id,
      ImageUrl: uploadResult.data.url,
      BlockId,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const createdImage = await this.prismaService.noteImage.create({
      data: dto,
    });

    return new OkResult('Image uploaded successfully.', createdImage);
  }
}
