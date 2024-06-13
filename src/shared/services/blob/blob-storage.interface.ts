import { Result } from "src/shared/result/result.interface";

export interface BlobStorage {
  upload(req: UploadRequest): Promise<Result<UploadResponse>>;
  delete(blobname: string): Promise<Result<null>>;
}

// Upload API
export interface UploadRequest {
  data: Buffer;
  contentType: string;
}

export interface UploadResponse {
  url: string;
}
