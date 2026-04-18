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
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  setUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

/**
 * POST /login -> { token, role }
 * After login we fetch /get-profile to populate the user object.
 */
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const { data } = await api.post("/login", payload);
    const token: string =
      data?.token || data?.access_token || data?.jwt || "";
    if (!token) throw new Error("No token returned by /login");

    const role: Role = (data?.role as Role) || "student";

    // Persist token first so subsequent calls send Authorization
    authStore.setToken(token);

    // Try to load full profile; tolerate missing endpoint
    let user: AuthUser = {
      email: payload.email,
      role,
      ...(data?.user || {}),
    };
    try {
      const { data: prof } = await api.get("/get-profile");
      const p = prof?.profile || prof || {};
      user = {
        email: p.email || payload.email,
        role: (p.role as Role) || role,
        name: p.name,
        usn: p.usn,
        department: p.department,
        avatarUrl: p.avatarUrl || p.avatar_url,
        ...p,
      };
    } catch {
      // ignore — keep minimal user
    }

    authStore.set(token, user);
    return { token, user };
  } catch (e) {
    throw toApiError(e);
  }
}

/**
 * POST /register -> { token, user }
 */
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
    const user: AuthUser = (data?.user as AuthUser) || {
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
