export function maskText(text: string ): string {
  return text.slice(3, text.length).replace(text, "*");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 3)}*****@${domain}`;
}
