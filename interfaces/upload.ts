export interface UploadProgress {
  progress: number;
  status: 'uploading' | 'processing' | 'success' | 'error';
  fileId?: string;
  analysisResult?: any;
  error?: string;
}
