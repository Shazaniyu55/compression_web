import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ApiKeyDto,
  AuthResponse,
  FileDto,
  JobDto,
  PlanDto,
  PresetDto,
  UsageDto,
} from '@/lib/types';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Files', 'Jobs', 'Usage', 'Keys'],
  endpoints: (b) => ({
    register: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: 'auth/register', method: 'POST', body }),
    }),
    login: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
    }),

    presets: b.query<PresetDto[], void>({ query: () => 'presets' }),

    files: b.query<FileDto[], void>({ query: () => 'files', providesTags: ['Files'] }),
    createUpload: b.mutation<
      { fileId: string; uploadUrl: string },
      { originalName: string; mimeType: string; sizeBytes: number }
    >({
      query: (body) => ({ url: 'uploads', method: 'POST', body }),
    }),
    completeUpload: b.mutation<FileDto, string>({
      query: (id) => ({ url: `uploads/${id}/complete`, method: 'POST' }),
      invalidatesTags: ['Files'],
    }),

    jobs: b.query<JobDto[], void>({ query: () => 'jobs', providesTags: ['Jobs'] }),
    createJob: b.mutation<JobDto, { fileId: string; preset: string }>({
      query: (body) => ({ url: 'jobs', method: 'POST', body }),
      invalidatesTags: ['Jobs', 'Usage'],
    }),
    jobDownload: b.query<{ url: string }, string>({ query: (id) => `jobs/${id}/download` }),

    usage: b.query<UsageDto, void>({ query: () => 'usage', providesTags: ['Usage'] }),

    plans: b.query<PlanDto[], void>({ query: () => 'billing/plans' }),
    checkout: b.mutation<{ checkoutUrl: string }, { planId: string }>({
      query: (body) => ({ url: 'billing/checkout', method: 'POST', body }),
    }),
    portal: b.mutation<{ portalUrl: string }, void>({
      query: () => ({ url: 'billing/portal', method: 'POST' }),
    }),
    verifySubscription: b.query<{ active: boolean; status: string }, string>({
      query: (reference) => `billing/verify?reference=${encodeURIComponent(reference)}`,
    }),
    cancelSubscription: b.mutation<{ cancelled: boolean }, void>({
      query: () => ({ url: 'billing/cancel', method: 'POST' }),
    }),

    apiKeys: b.query<ApiKeyDto[], void>({ query: () => 'auth/api-keys', providesTags: ['Keys'] }),
    createApiKey: b.mutation<{ id: string; name: string; apiKey: string }, { name: string }>({
      query: (body) => ({ url: 'auth/api-keys', method: 'POST', body }),
      invalidatesTags: ['Keys'],
    }),
    revokeApiKey: b.mutation<{ revoked: boolean }, string>({
      query: (id) => ({ url: `auth/api-keys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Keys'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  usePresetsQuery,
  useFilesQuery,
  useCreateUploadMutation,
  useCompleteUploadMutation,
  useJobsQuery,
  useCreateJobMutation,
  useLazyJobDownloadQuery,
  useUsageQuery,
  usePlansQuery,
  useCheckoutMutation,
  usePortalMutation,
  useLazyVerifySubscriptionQuery,
  useCancelSubscriptionMutation,
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = api;
