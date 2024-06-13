import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import {
  BlobStorage,
  UploadRequest,
  UploadResponse,
} from '../../blob-storage.interface';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/server/env.validation';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  ErrorResult,
  OkResult,
  Result,
} from 'src/shared/result/result.interface';
import { Status } from 'src/shared/result/status.enum';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AzureBlobStorageService implements BlobStorage {
  private readonly url: string = this.configService.get<string>('BLOBSTG_URL');
  private readonly container: string =
    this.configService.get<string>('BLOBSTG_CONTAINER');
  private readonly azblobstg: ContainerClient =
    BlobServiceClient.fromConnectionString(
      this.configService.get<string>('BLOBSTG_CONNSTR'),
    ).getContainerClient(this.container);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async upload(req: UploadRequest): Promise<Result<UploadResponse>> {
    const blobname = `${randomBytes(12).toString('base64url')}`;

    const client = this.azblobstg.getBlockBlobClient(blobname);
    const resp = await client.uploadData(req.data, {
      blobHTTPHeaders: { blobContentType: req.contentType },
    });

    if (resp._response.status != (HttpStatus.CREATED as number)) {
      return new ErrorResult(
        Status.InternalException,
        'Failed to upload file to blob storage.',
      );
    }

    return new OkResult('File successfully uploaded to blob storage.', {
      url: `${this.url}/${this.container}/${blobname}`,
    });
  }

  async delete(blobname: string): Promise<Result<null>> {
    blobname = blobname.replace(`${this.url}/${this.container}/`, '');
    const resp = await this.azblobstg.deleteBlob(blobname);

    if (resp._response.status != (HttpStatus.ACCEPTED as number)) {
      return new ErrorResult(
        Status.InternalException,
        'Failed to delete file from blob storage.',
      );
    }

    return new OkResult('File successfully deleted from blob storage.');
  }
}
