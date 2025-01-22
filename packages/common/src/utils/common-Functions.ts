export function maskText(text: string): string {
  return text.slice(3, text.length).replace(text, "*");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 3)}*****@${domain}`;
}

export function maskString(data: string) {
  if (!data || typeof data !== "string") return "";

  // Regex patterns to identify components
  const phoneRegex = /\b\d{3,}\b/g; // Matches sequences of digits (likely phone numbers)
  const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g; // Matches email addresses
  const postcodeRegex = /\b[A-Z0-9]{2,4}\s?[A-Z0-9]{3}\b/gi; // Matches UK postcodes

  // Replace matched patterns with their masked versions
  let maskedText = data.replace(phoneRegex, match => maskPhone(match));
  maskedText = maskedText.replace(emailRegex, match => maskChatEmail(match));
  maskedText = maskedText.replace(postcodeRegex, match => maskPostcode(match));

  return maskedText;
}

// Masking functions
export function maskPhone(data: string) {
  return data.length > 3
    ? data.slice(0, 3) + "*".repeat(data.length - 3)
    : data;
}

function maskChatEmail(data: string) {
  const [localPart, domain] = data.split("@");
  if (!domain) return data; // Not a valid email
  return (
    localPart.slice(0, 3) + "*".repeat(localPart.length - 3) + "@" + domain
  );
}

export function maskPostcode(data: string) {
  return data.length > 3
    ? data.slice(0, 3) + "*".repeat(data.length - 3)
    : data;
}

export function getExtension(docType: string): string {
  const docTypeToExtension: Record<string, string> = {
    'text': '.txt',
    'document': '.docx',
    'spreadsheet': '.xlsx',
    'presentation': '.pptx',
    'pdf': '.pdf',
    'image/jpg': '.jpg',
    'image/jpeg': '.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/svg': '.svg',
    'image/webp': '.webp',
    'audio': '.mp3',
    'video': '.mp4',
    'html': '.html',
    'json': '.json',
    'xml': '.xml',
    'csv': '.csv',
    'markdown': '.md',
    // Add more mappings as needed
  };

  const extension = docTypeToExtension[docType.toLowerCase()];
  return extension || '.unknown'; // Default to ".unknown" if docType is not found
}

import axios from 'axios';

export const getDistance = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string
): Promise<number> => {
  // Validate input coordinates
  if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
    throw new Error('Invalid origin or destination coordinates');
  }

  try {
    // Make a request to the Google Directions API
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: 'driving', // Travel mode
        key: apiKey, // Google Maps API key
      },
    });

    // Check if the API response is valid
    if (response.data.status !== 'OK') {
      throw new Error(`Google Directions API error: ${response.data.status}`);
    }

    // Extract distance in meters using destructuring
    const { distance } = response.data.routes[0].legs[0];
    if (!distance?.value) {
      throw new Error('Distance not found in API response');
    }
    const distanceInMiles = Number((distance.value / 1609.34).toFixed(2));
    return distanceInMiles;
  } catch (error) {
    console.error('Error calculating distance:', error);
    throw new Error(`Error calculating distance: ${error instanceof Error ? error.message : error}`);
  }
};