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

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async upload(req: UploadRequest): Promise<Result<UploadResponse>> {
    const blobName = `${randomBytes(12).toString('base64url')}`;

    const azureBlobStorage: ContainerClient =
      BlobServiceClient.fromConnectionString(
        this.configService.get<string>('BLOBSTG_CONNSTR'),
      ).getContainerClient(req.container);

    const client = azureBlobStorage.getBlockBlobClient(blobName);
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
      url: `${this.url}/${req.container}/${blobName}`,
    });
  }

  async delete(blobUrl: string, container: string): Promise<Result<null>> {
    const azureBlobStorage: ContainerClient =
    BlobServiceClient.fromConnectionString(
      this.configService.get<string>('BLOBSTG_CONNSTR'),
    ).getContainerClient(container);

    blobUrl = blobUrl.replace(`${this.url}/${container}/`, '');
    const resp = await azureBlobStorage.deleteBlob(blobUrl);

    if (resp._response.status != (HttpStatus.ACCEPTED as number)) {
      return new ErrorResult(
        Status.InternalException,
        'Failed to delete file from blob storage.',
      );
    }

    return new OkResult('File successfully deleted from blob storage.');
  }

  async download(blobUrl: string): Promise<Result<NodeJS.ReadableStream>> {
    const azureBlobStorage: ContainerClient =
    BlobServiceClient.fromConnectionString(
      this.configService.get<string>('BLOBSTG_CONNSTR'),
    ).getContainerClient('drive');

    blobUrl = blobUrl.replace(`${this.url}/drive/`, '');
    const resp = await azureBlobStorage.getBlobClient(blobUrl);
    const stream = (await resp.download()).readableStreamBody;

    return new OkResult(
      'File successfully downloaded from blob storage.',
      stream,
    );
  }

  async uploadBase64(base64: string): Promise<Result<UploadResponse>> {
    const azureBlobStorage: ContainerClient =
    BlobServiceClient.fromConnectionString(
      this.configService.get<string>('BLOBSTG_CONNSTR'),
    ).getContainerClient('drive');

    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const blobName = `${randomBytes(12).toString('base64url')}`;

    await azureBlobStorage.uploadBlockBlob(
      blobName,
      buffer,
      buffer.length,
      {
        blobHTTPHeaders: { blobContentType: type },
      },
    );

    return new OkResult('File successfully uploaded to blob storage.', {
      url: `${this.url}/drive/${blobName}`,
    });
  }
}
