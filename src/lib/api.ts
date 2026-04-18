import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const PRIMARY = import.meta.env.VITE_API_BASE_URL_PRIMARY ?? "";
const FALLBACK = import.meta.env.VITE_API_BASE_URL_FALLBACK ?? "";
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY ?? "trackademic_token";

const HEALTH_PATH = "/"; // any cheap GET; backend root is fine
const HEALTH_TIMEOUT_MS = 2500;

let resolvedBase: string | null = null;
let resolving: Promise<string> | null = null;

async function ping(base: string): Promise<boolean> {
  if (!base) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT_MS);
    await fetch(base + HEALTH_PATH, {
      method: "GET",
      mode: "cors",
      signal: ctrl.signal,
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

export async function resolveBaseUrl(): Promise<string> {
  if (resolvedBase) return resolvedBase;
  if (resolving) return resolving;
  resolving = (async () => {
    if (await ping(PRIMARY)) {
      resolvedBase = PRIMARY;
    } else if (await ping(FALLBACK)) {
      resolvedBase = FALLBACK;
    } else {
      // default to primary so the user sees a real network error
      resolvedBase = PRIMARY || FALLBACK;
    }
    return resolvedBase!;
  })();
  return resolving;
}

const instance: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

instance.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    config.baseURL = await resolveBaseUrl();
  }
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    // If primary failed at network level, try fallback once for this request
    const cfg = error.config as
      | (AxiosRequestConfig & { _retried?: boolean })
      | undefined;
    if (
      cfg &&
      !cfg._retried &&
      !error.response &&
      resolvedBase === PRIMARY &&
      FALLBACK
    ) {
      cfg._retried = true;
      cfg.baseURL = FALLBACK;
      resolvedBase = FALLBACK;
      try {
        return await instance.request(cfg);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  },
);

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
