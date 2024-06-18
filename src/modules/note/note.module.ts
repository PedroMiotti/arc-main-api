import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';
import { FileService } from '../drive/modules/file/file.service';
import { BlobStoreModule } from 'src/config/server/dependencies';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [NoteController],
  providers: [NoteService, FileService, BlobStoreModule],
})
export class NoteModule {}
