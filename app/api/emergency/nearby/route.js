import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const overpassEndpoints = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter"
];

const fallbackEmergencyPlaces = [
  { name: "Hopital Charles Nicolle", kind: "Hopital", lat: 36.80656, lng: 10.15835 },
  { name: "Hopital La Rabta", kind: "Hopital", lat: 36.80798, lng: 10.14691 },
  { name: "Hopital Habib Thameur", kind: "Hopital", lat: 36.79479, lng: 10.17634 },
  { name: "Hopital Militaire de Tunis", kind: "Hopital", lat: 36.83174, lng: 10.16058 },
  { name: "Institut Kassab", kind: "Hopital", lat: 36.83502, lng: 10.11353 },
  { name: "Hopital Mongi Slim La Marsa", kind: "Hopital", lat: 36.85665, lng: 10.29474 },
  { name: "Hopital Regional de Ben Arous", kind: "Hopital", lat: 36.7449, lng: 10.21979 },
  { name: "CHU Farhat Hached Sousse", kind: "Hopital", lat: 35.82585, lng: 10.63698 },
  { name: "CHU Sahloul Sousse", kind: "Hopital", lat: 35.83902, lng: 10.59383 },
  { name: "CHU Hedi Chaker Sfax", kind: "Hopital", lat: 34.74044, lng: 10.76054 },
  { name: "Hopital Fattouma Bourguiba Monastir", kind: "Hopital", lat: 35.76943, lng: 10.82794 }
];

const distanceInMeters = (fromLat, fromLng, toLat, toLng) => {
  const earthRadius = 6371000;
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180)
    * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const describeEmergencyPlace = tags => {
  if (!tags) return "Service medical";
  if (tags.emergency === "ambulance_station") return "Ambulance";
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") {
    return tags.emergency === "yes" ? "Hopital avec urgence" : "Hopital";
  }
  if (tags.amenity === "clinic" || tags.healthcare === "clinic") return "Clinique";
  if (tags.amenity === "doctors" || tags.healthcare === "doctor") return "Medecin";
  return "Service medical";
};

const buildOverpassQuery = (lat, lng) => `
  [out:json][timeout:3];
  (
    node(around:20000,${lat},${lng})["amenity"~"hospital|clinic|doctors"];
    way(around:20000,${lat},${lng})["amenity"~"hospital|clinic|doctors"];
    relation(around:20000,${lat},${lng})["amenity"~"hospital|clinic|doctors"];
    node(around:20000,${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
    way(around:20000,${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
    relation(around:20000,${lat},${lng})["healthcare"~"hospital|clinic|doctor"];
    node(around:20000,${lat},${lng})["emergency"="ambulance_station"];
    way(around:20000,${lat},${lng})["emergency"="ambulance_station"];
    relation(around:20000,${lat},${lng})["emergency"="ambulance_station"];
  );
  out center tags 50;
`;

const normalizePlace = (place, lat, lng, source) => ({
  id: place.id || `${place.name}-${place.lat}-${place.lng}`,
  name: place.name,
  kind: place.kind,
  lat: place.lat,
  lng: place.lng,
  phone: place.phone || "",
  distance: Math.round(distanceInMeters(lat, lng, place.lat, place.lng)),
  mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
  source
});

const fallbackPlaces = (lat, lng) => fallbackEmergencyPlaces
  .map(place => normalizePlace(place, lat, lng, "fallback"))
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 5);

const fetchOverpassEndpoint = async (endpoint, query) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1800);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: new URLSearchParams({ data: query }),
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "OlderCare emergency nearby lookup"
      }
    });
    if (!response.ok) {
      throw new Error(`Overpass ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchOverpassPlaces = async (lat, lng) => {
  const query = buildOverpassQuery(lat, lng);
  const data = await Promise.any(overpassEndpoints.map(endpoint => fetchOverpassEndpoint(endpoint, query)));
  const places = (data.elements || [])
    .map(element => {
      const placeLat = element.lat || element.center?.lat;
      const placeLng = element.lon || element.center?.lon;
      if (placeLat == null || placeLng == null) return null;
      const tags = element.tags || {};
      return normalizePlace({
        id: `${element.type}-${element.id}`,
        name: tags["name:fr"] || tags.name || tags.operator || "Urgence medicale proche",
        kind: describeEmergencyPlace(tags),
        lat: Number(placeLat),
        lng: Number(placeLng),
        phone: tags.phone || tags["contact:phone"] || ""
      }, lat, lng, "overpass");
    })
    .filter(Boolean)
    .filter((place, index, list) => list.findIndex(item => item.id === place.id) === index)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (places.length === 0) {
    throw new Error("No Overpass places");
  }

  return places;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Coordonnees invalides", places: [] }, { status: 400 });
  }

  try {
    const places = await fetchOverpassPlaces(lat, lng);
    return NextResponse.json({ places, source: "overpass" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { places: fallbackPlaces(lat, lng), source: "fallback" },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
