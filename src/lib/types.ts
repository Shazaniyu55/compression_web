export interface AuthResponse {
  userId: string;
  accessToken: string;
}

export interface FileDto {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: 'pending_upload' | 'uploaded';
  createdAt: string;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobDto {
  id: string;
  fileId: string;
  preset: string;
  status: JobStatus;
  progress: number;
  inputSizeBytes: number | null;
  outputSizeBytes: number | null;
  savedPercent: number | null;
  error: string | null;
  createdAt: string;
}

export interface PresetDto {
  name: string;
  kind: 'video' | 'image' | 'generic' | 'hls';
  outputExtension: string;
}

export interface UsageDto {
  bytesIn: number;
  bytesOut: number;
  encodeSeconds: number;
  jobs: number;
  periodStart: string;
}

export interface PlanDto {
  id: string;
  name: string;
  monthlyPriceCents: number;
  includedBytes: string;
  maxFileSizeBytes: string;
  priority: number;
  stripePriceId: string | null;
}

export interface ApiKeyDto {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface JobEvent {
  type: 'job.progress' | 'job.completed' | 'job.failed';
  jobId: string;
  progress?: number;
  error?: string;
}
