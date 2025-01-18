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