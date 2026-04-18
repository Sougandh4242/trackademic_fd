import axios, { AxiosError, AxiosInstance } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://nonenigmatically-colloidal-natalie.ngrok-free.dev";
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY ?? "trackademic_token";

export async function resolveBaseUrl(): Promise<string> {
  return BASE_URL;
}

const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

instance.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
  return config;
});

export const api = instance;

export type ApiError = { message: string; status?: number };

export function toApiError(e: unknown): ApiError {
  const err = e as AxiosError<{ message?: string; error?: string }>;
  const msg =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    "Something went wrong";
  return { message: msg, status: err.response?.status };
}
