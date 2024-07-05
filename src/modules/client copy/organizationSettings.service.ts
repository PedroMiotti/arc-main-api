import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateOrganizationSettingsDto } from './dto/create-organization-settings.dto';
import { JwtClaims } from 'src/shared/http/jwt.decorator';
import { ErrorResult, OkResult } from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { Prisma } from '@prisma/client';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { ServerDependency } from 'src/config/server/dependencies';
import { BlobStorage } from 'src/shared/services/blob/blob-storage.interface';

@Injectable()
export class OrganizationSettingsService {
  constructor(
    private readonly prismaService: PrismaService,

    @Inject(ServerDependency.BlobStorage)
    private readonly fileStorageService: BlobStorage,
  ) {}

  async create(createOrganizationSettingsDto: CreateOrganizationSettingsDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        Id: Number(createOrganizationSettingsDto.OwnerId),
      },
    });

    if (!existingUser) {
      return new ErrorResult(
        Status.BadRequest,
        'A owner was not found with the provided Id.',
      );
    }

    const { Name, LogoImage, OwnerId } = createOrganizationSettingsDto;

    const uploadResult = await this.fileStorageService.upload({
      data: LogoImage.buffer,
      contentType: LogoImage.mimetype,
    });

    if (!uploadResult.ok || uploadResult.data === null)
      return new ErrorResult(uploadResult.status, uploadResult.message);

    const dto: Prisma.OrganizationSettingsUncheckedCreateInput = {
      Name,
      LogoUrl: uploadResult.data.url,
      OwnerId: Number(OwnerId),
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    };

    const organizationSettings =
      await this.prismaService.organizationSettings.create({ data: dto });

    return new OkResult(
      'Organization Settings has been successfully created.',
      organizationSettings,
    );
  }

  async findOne(id: number) {
    const organizationSettings =
      await this.prismaService.organizationSettings.findUnique({
        where: { Id: id },
      });

    if (!organizationSettings) {
      return new ErrorResult(
        Status.NotFound,
        'Organization Settings not found.',
      );
    }

    return new OkResult('Organization Settings found.', organizationSettings);
  }

  async findOneByOwnerId(ownerId: number) {
    const organizationSettings =
      await this.prismaService.organizationSettings.findUnique({
        where: { OwnerId: ownerId },
      });

    if (!organizationSettings) {
      return new ErrorResult(
        Status.NotFound,
        'Organization Settings not found.',
      );
    }

    return new OkResult('Organization Settings found.', organizationSettings);
  }

  async update(
    id: number,
    updateOrganizationSettingsDto: UpdateOrganizationSettingsDto,
  ) {
    const existingOrganizationSettings =
      await this.prismaService.organizationSettings.findUnique({
        where: { Id: id },
      });

    if (!existingOrganizationSettings)
      return new ErrorResult(
        Status.NotFound,
        'Organization Settings not found.',
      );

    const { Name, LogoImage } = updateOrganizationSettingsDto;

    const dto: Prisma.OrganizationSettingsUncheckedUpdateInput = {
      Name,
      UpdatedAt: new Date(),
    };

    if (LogoImage) {
      const uploadResult = await this.fileStorageService.upload({
        data: LogoImage.buffer,
        contentType: LogoImage.mimetype,
      });

      // Todo clean up old logo image

      if (!uploadResult.ok || uploadResult.data === null)
        return new ErrorResult(uploadResult.status, uploadResult.message);

      dto.LogoUrl = uploadResult.data.url;
    }

    const updatedOrganizationSettings =
      await this.prismaService.organizationSettings.update({
        where: { Id: id },
        data: { ...dto },
      });

    return new OkResult(
      'Organization Settings has been successfully updated.',
      updatedOrganizationSettings,
    );
  }
}
