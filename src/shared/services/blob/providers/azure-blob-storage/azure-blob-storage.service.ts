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
  private readonly azureBlobStorage: ContainerClient =
    BlobServiceClient.fromConnectionString(
      this.configService.get<string>('BLOBSTG_CONNSTR'),
    ).getContainerClient(this.container);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async upload(req: UploadRequest): Promise<Result<UploadResponse>> {
    const blobName = `${randomBytes(12).toString('base64url')}`;

    const client = this.azureBlobStorage.getBlockBlobClient(blobName);
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
      url: `${this.url}/${this.container}/${blobName}`,
    });
  }

  async delete(blobUrl: string): Promise<Result<null>> {
    blobUrl = blobUrl.replace(`${this.url}/${this.container}/`, '');
    const resp = await this.azureBlobStorage.deleteBlob(blobUrl);

    if (resp._response.status != (HttpStatus.ACCEPTED as number)) {
      return new ErrorResult(
        Status.InternalException,
        'Failed to delete file from blob storage.',
      );
    }

    return new OkResult('File successfully deleted from blob storage.');
  }

  async download(blobUrl: string): Promise<Result<NodeJS.ReadableStream>> {
    blobUrl = blobUrl.replace(`${this.url}/${this.container}/`, '');
    const resp = await this.azureBlobStorage.getBlobClient(blobUrl);
    const stream = (await resp.download()).readableStreamBody;

    return new OkResult(
      'File successfully downloaded from blob storage.',
      stream,
    );
  }

  async uploadBase64(base64: string): Promise<Result<UploadResponse>> {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const blobName = `${randomBytes(12).toString('base64url')}`;

    await this.azureBlobStorage.uploadBlockBlob(
      blobName,
      buffer,
      buffer.length,
      {
        blobHTTPHeaders: { blobContentType: type },
      },
    );

    return new OkResult('File successfully uploaded to blob storage.', {
      url: `${this.url}/${this.container}/${blobName}`,
    });
  }
}
