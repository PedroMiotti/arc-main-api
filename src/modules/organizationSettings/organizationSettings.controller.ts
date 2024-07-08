import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OrganizationSettingsService } from './organizationSettings.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { handleResponse } from 'src/shared/http/handle-response';
import { Jwt, JwtClaims } from 'src/shared/http/jwt.decorator';
import { CreateOrganizationSettingsDto } from './dto/create-organization-settings.dto';
import { Response } from 'express';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicRoute } from 'src/shared/http/is-public-route.decorator';

@ApiTags('Organization Settings')
@UseGuards(JwtGuard)
@ApiBearerAuth('Authorization')
@Controller('organization-settings')
export class OrganizationSettingsController {
  constructor(
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {}

  @PublicRoute()
  @ApiOperation({ summary: 'Create a new Organization Settings' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('LogoImage'))
  @Post()
  async create(
    @Body() createOrganizationSettingsDto: CreateOrganizationSettingsDto,
    @UploadedFile() fileBinary: Express.Multer.File,
    @Res() response: Response,
  ) {
    createOrganizationSettingsDto.LogoImage = fileBinary;
    const result = await this.organizationSettingsService.create(
      createOrganizationSettingsDto,
    );

    handleResponse(response, HttpStatus.CREATED, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get a organization settings by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response: Response) {
    const result = await this.organizationSettingsService.findOne(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Get a organization settings by Owner ID' })
  @Get('/owner/:id')
  async findOneByOwnerId(@Param('id') id: string, @Res() response: Response) {
    const result = await this.organizationSettingsService.findOneByOwnerId(+id);

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }

  @ApiOperation({ summary: 'Update a organization settings by ID' })
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('LogoImage'))
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateOrganizationSettingsDto,
    @Res() response: Response,
  ) {
    const result = await this.organizationSettingsService.update(
      +id,
      updateClientDto,
    );

    handleResponse(response, HttpStatus.OK, {
      Meta: { Message: result.message },
      Data: result.data,
    });
  }
}
