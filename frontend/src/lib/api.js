let cachedBaseUrl = null;
async function getBaseUrl() {
    if (cachedBaseUrl) {
        return cachedBaseUrl;
    }
    const response = await fetch("/config.json");
    if (!response.ok) {
        cachedBaseUrl = "http://localhost:3001";
        return cachedBaseUrl;
    }
    const config = (await response.json());
    cachedBaseUrl = config.apiBaseUrl || "http://localhost:3001";
    return cachedBaseUrl;
}
async function request(path, init) {
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
        const payload = ((await response.json().catch(() => ({}))) || {});
        throw new Error(payload.error?.message || "Something went wrong. Please try again.");
    }
    return response.json();
}
export async function getSession() {
    return request("/api/auth/me");
}
export async function register(email, password) {
    return request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}
export async function login(email, password) {
    return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
}
export async function logout() {
    return request("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({})
    });
}
export async function getRecommendations(payload) {
    return request("/api/recommendations", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export async function saveOutfit(payload) {
    return request("/api/saved-outfits", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export async function getSavedOutfits() {
    return request("/api/saved-outfits");
}
export async function deleteSavedOutfit(id) {
    return request(`/api/saved-outfits/${id}`, {
        method: "DELETE"
    });
}
