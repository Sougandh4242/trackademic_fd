import { api, toApiError } from "./api";

export type Role = "student" | "faculty";

export interface AuthUser {
  id?: string;
  name?: string;
  email: string;
  role: Role;
  usn?: string;
  department?: string;
  avatarUrl?: string;
  [k: string]: unknown;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY =
  import.meta.env.VITE_AUTH_TOKEN_KEY ?? "trackademic_token";
const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY ?? "trackademic_user";

export const authStore = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  set(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("trackademic:auth"));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event("trackademic:auth"));
  },
};

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await api.post("/login", payload);
    // be liberal in what we accept
    const token: string =
      data?.token || data?.access_token || data?.jwt || "";
    const user: AuthUser = data?.user ||
      data?.profile || {
        email: payload.email,
        role: (data?.role as Role) || "student",
      };
    if (!token) throw new Error("No token returned by /login");
    authStore.set(token, user);
    return { token, user };
  } catch (e) {
    throw toApiError(e);
  }
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
  usn?: string;
  department?: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await api.post("/register", payload);
    const token: string =
      data?.token || data?.access_token || data?.jwt || "";
    const user: AuthUser = data?.user || {
      name: payload.name,
      email: payload.email,
      role: payload.role,
      usn: payload.usn,
      department: payload.department,
    };
    if (token) authStore.set(token, user);
    return { token, user };
  } catch (e) {
    throw toApiError(e);
  }
}

export function logout() {
  authStore.clear();
}
