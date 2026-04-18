import { api, toApiError } from "./api";

async function call<T>(fn: () => Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await fn();
    return data;
  } catch (e) {
    throw toApiError(e);
  }
}

export const profileApi = {
  get: () => call<any>(() => api.get("/get-profile")),
  getFull: () => call<any>(() => api.get("/get-full-profile")),
  create: (payload: any) => call<any>(() => api.post("/create-profile", payload)),
  update: (payload: any) => call<any>(() => api.post("/update-profile", payload)),
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return call<any>(() =>
      api.post("/upload-profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
};

export const recordsApi = {
  addSkill: (payload: any) => call<any>(() => api.post("/add-skill", payload)),
  addProject: (payload: any) => call<any>(() => api.post("/add-project", payload)),
  addCertification: (payload: any) =>
    call<any>(() => api.post("/add-certification", payload)),
  addInternship: (payload: any) =>
    call<any>(() => api.post("/add-internship", payload)),
  addHackathon: (payload: any) =>
    call<any>(() => api.post("/add-hackathon", payload)),
  upload: (file: File, kind?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (kind) fd.append("kind", kind);
    return call<any>(() =>
      api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  },
};

export const facultyApi = {
  topStudents: (params?: { department?: string; limit?: number }) =>
    call<any>(() => api.get("/top-students-all", { params })),
};

export const aiApi = {
  semanticSearch: (query: string) =>
    call<any>(() => api.post("/semantic-search", { query })),
  chat: (message: string, history?: { role: string; content: string }[]) =>
    call<any>(() => api.post("/chat", { message, history })),
};
