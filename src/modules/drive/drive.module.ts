import { PrismaModule } from 'src/config/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DriveController } from './drive.controller';
import { Module } from '@nestjs/common';
import { FolderService } from './modules/folder/folder.service';
import { FileService } from './modules/file/file.service';
import { BlobStoreModule } from 'src/config/server/dependencies';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DriveController],
  providers: [FolderService, FileService, BlobStoreModule],
})
export class DriveModule {}
