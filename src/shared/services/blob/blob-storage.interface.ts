import { Result } from "src/shared/result/result.interface";

export interface BlobStorage {
  upload(req: UploadRequest): Promise<Result<UploadResponse>>;
  uploadBase64(base64: string): Promise<Result<UploadResponse>>;
  delete(blobUrl: string): Promise<Result<null>>;
  download(blobUrl: string): Promise<Result<NodeJS.ReadableStream>>;
}

// Upload API
export interface UploadRequest {
  data: Buffer;
  contentType: string;
}

export interface UploadResponse {
  url: string;
}
