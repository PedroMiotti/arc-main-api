import { Module } from '@nestjs/common';
import { OrganizationSettingsService } from './organizationSettings.service';
import { OrganizationSettingsController } from './organizationSettings.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FileService } from '../drive/modules/file/file.service';
import { BlobStoreModule } from 'src/config/server/dependencies';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService, FileService, BlobStoreModule],
})
export class OrganizationSettingsModule {}
