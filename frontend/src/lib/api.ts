import type {
  AuthUser,
  SavePayload,
  SavedOutfit,
  Suggestion,
  WeatherSummary
} from "./types";

type ApiErrorShape = {
  error?: {
    message?: string;
  };
};

let cachedBaseUrl: string | null = null;

async function getBaseUrl() {
  if (cachedBaseUrl) {
    return cachedBaseUrl;
  }

  const response = await fetch("/config.json");
  if (!response.ok) {
    cachedBaseUrl = "http://localhost:3001";
    return cachedBaseUrl;
  }

  const config = (await response.json()) as { apiBaseUrl?: string };
  cachedBaseUrl = config.apiBaseUrl || "http://localhost:3001";
  return cachedBaseUrl;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    ...init
  });

  if (!response.ok) {
    const payload = ((await response.json().catch(() => ({}))) || {}) as ApiErrorShape;
    throw new Error(payload.error?.message || "Something went wrong. Please try again.");
  }

  return response.json() as Promise<T>;
}

export async function getSession() {
  return request<{ user: AuthUser }>("/api/auth/me");
}

export async function register(email: string, password: string) {
  return request<{ user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function login(email: string, password: string) {
  return request<{ user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export async function logout() {
  return request<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({})
  });
}

export async function getRecommendations(payload: {
  mood: string;
  weather:
    | { source: "manual"; temperatureC: number; condition: string }
    | { source: "geo"; latitude: number; longitude: number };
}) {
  return request<{ weatherSummary: WeatherSummary; suggestions: Suggestion[] }>(
    "/api/recommendations",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );
}

export async function saveOutfit(payload: SavePayload) {
  return request<{ savedOutfit: SavedOutfit }>("/api/saved-outfits", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getSavedOutfits() {
  return request<{ savedOutfits: SavedOutfit[] }>("/api/saved-outfits");
}

export async function deleteSavedOutfit(id: string) {
  return request<{ ok: boolean }>(`/api/saved-outfits/${id}`, {
    method: "DELETE"
  });
}
