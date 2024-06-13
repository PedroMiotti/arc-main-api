import { Provider } from '@nestjs/common';
import { AzureBlobStorageService } from 'src/shared/services/blob/providers/azure-blob-storage/azure-blob-storage.service';

export enum ServerDependency {
  BlobStorage = 'BlobStorage',
}

export const BlobStoreModule: Provider = {
  provide: ServerDependency.BlobStorage,
  useClass: AzureBlobStorageService,
};
