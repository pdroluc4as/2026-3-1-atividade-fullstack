// Detecta e ajusta dinamicamente a URL base da API
export const API_BASE_URL = (() => {
  // 1. Usa a variável de ambiente se você definir no .env.local
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Se estiver rodando no navegador e for um link do Codespace
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("github.dev")
  ) {
    // Substitui a porta do frontend (3000) pela porta do backend (3001)
    // Ex: https://nome-do-codespace-3000.app.github.dev vira https://nome-do-codespace-3001.app.github.dev
    return window.location.origin.replace("-3000", "-3001");
  }

  // 3. Fallback padrão para quando rodar localmente na sua máquina[cite: 2]
  return "http://localhost:3001";
})();

export class ApiError extends Error {
  status: number; //[cite: 2]

  constructor(message: string, status: number) {
    //[cite: 2]
    super(message); //[cite: 2]
    this.name = "ApiError"; //[cite: 2]
    this.status = status; //[cite: 2]
  }
}

async function request<T>(
  //[cite: 2]
  endpoint: string, //[cite: 2]
  options: RequestInit = {}, //[cite: 2]
): Promise<T> {
  //[cite: 2]
  const token = //[cite: 2]
    typeof window !== "undefined" ? localStorage.getItem("token") : null; //[cite: 2]

  const headers = new Headers(options.headers ?? {}); //[cite: 2]

  if (!(options.body instanceof FormData)) {
    //[cite: 2]
    headers.set("Content-Type", "application/json"); //[cite: 2]
  }

  if (token) {
    //[cite: 2]
    headers.set("Authorization", `Bearer ${token}`); //[cite: 2]
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    //[cite: 2]
    ...options, //[cite: 2]
    headers, //[cite: 2]
  });

  if (!response.ok) {
    //[cite: 2]
    let message = "Erro ao realizar a requisição."; //[cite: 2]

    try {
      //[cite: 2]
      const errorBody = await response.json(); //[cite: 2]
      message = errorBody?.message ?? message; //[cite: 2]
    } catch {
      //[cite: 2]
      message = response.statusText || message; //[cite: 2]
    }

    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("avatarUrl");
      window.location.href = "/login";
    }

    throw new ApiError(message, response.status); //[cite: 2]
  }

  if (response.status === 204) {
    //[cite: 2]
    return undefined as T; //[cite: 2]
  }

  return response.json() as Promise<T>; //[cite: 2]
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestInit, //[cite: 2]
  ) => request<T>(endpoint, { ...options, method: "GET" }), //[cite: 2]

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit, //[cite: 2]
  ) =>
    request<T>(endpoint, {
      //[cite: 2]
      ...options, //[cite: 2]
      method: "POST", //[cite: 2]
      body: body ? JSON.stringify(body) : undefined, //[cite: 2]
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit, //[cite: 2]
  ) =>
    request<T>(endpoint, {
      //[cite: 2]
      ...options, //[cite: 2]
      method: "PUT", //[cite: 2]
      body: body ? JSON.stringify(body) : undefined, //[cite: 2]
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit, //[cite: 2]
  ) =>
    request<T>(endpoint, {
      //[cite: 2]
      ...options, //[cite: 2]
      method: "PATCH", //[cite: 2]
      body: body ? JSON.stringify(body) : undefined, //[cite: 2]
    }),

  del: <T>(
    endpoint: string,
    options?: RequestInit, //[cite: 2]
  ) => request<T>(endpoint, { ...options, method: "DELETE" }), //[cite: 2]
};

export default api; //[cite: 2]
