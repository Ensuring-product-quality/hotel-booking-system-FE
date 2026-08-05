import { apiClient } from "../services/apiClient";

export const DEFAULT_HOTEL_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800";

export const DEFAULT_ROOM_IMAGE =
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800";

export function getBackendOrigin(): string {
  const baseURL = apiClient.defaults.baseURL || "";
  // baseURL looks like "https://hotel-booking-system-be-production.up.railway.app/api" or "http://localhost:8080/api"
  return baseURL.replace(/\/api\/?$/, "");
}

export function getMediaUrl(url?: string, fallback = DEFAULT_HOTEL_IMAGE): string {
  if (!url || !url.trim()) {
    return fallback;
  }
  const cleanUrl = url.trim();

  // If URL starts with http:// or https://
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    const backendOrigin = getBackendOrigin();
    
    // If it's an Unsplash URL, replace width and quality params to make images sharp/high-res
    if (cleanUrl.includes("images.unsplash.com")) {
      return cleanUrl.replace(/w=\d+/, "w=1200").replace(/q=\d+/, "q=90");
    }

    // If URL points to localhost:8080 or 127.0.0.1:8080, but current backend origin is remote (e.g. railway)
    if (
      backendOrigin &&
      !backendOrigin.includes("localhost") &&
      (cleanUrl.includes("localhost:8080") || cleanUrl.includes("127.0.0.1:8080"))
    ) {
      return cleanUrl.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/, backendOrigin);
    }
    return cleanUrl;
  }

  // If it's a relative path starting with / or uploads/
  const backendOrigin = getBackendOrigin();
  const normalizedPath = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
  return `${backendOrigin}${normalizedPath}`;
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallback = DEFAULT_HOTEL_IMAGE
) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
}
