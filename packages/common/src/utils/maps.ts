export function createGoogleMapsLink(location: string): string {
  const encodedLocation = encodeURIComponent(location);
  return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export function createGoogleMapsDirectionsLink(from: Coordinates | null, to: Coordinates | null): string | null {
  if (!from && !to) return null;
  
  if (from && !to) {
    const location = `${from.latitude},${from.longitude}`;
    return `https://www.google.com/maps/search/?api=1&query=${location}`;
  }
  
  if (from && to) {
    const origin = `${from.latitude},${from.longitude}`;
    const destination = `${to.latitude},${to.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }
  
  return null;
}
