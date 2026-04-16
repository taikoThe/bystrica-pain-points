import { getCityPart } from "./city-parts";

export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: { "User-Agent": "BystricaPainPoints/1.0" },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.address) {
      const a = data.address;
      const street = a.road || a.pedestrian || a.path || "";
      const cityPart = getCityPart(street);
      const parts = [
        a.house_number ? `${street} ${a.house_number}` : street,
        cityPart || a.city || a.town || a.village || "Banská Bystrica",
        a.postcode,
      ].filter(Boolean);
      return parts.join(", ");
    }
    return data.display_name || null;
  } catch {
    return null;
  }
}

export async function searchAddress(
  query: string
): Promise<GeocodingResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", Banská Bystrica"
      )}&limit=5`,
      {
        headers: { "User-Agent": "BystricaPainPoints/1.0" },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: { display_name: string; lat: string; lon: string }) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
}
