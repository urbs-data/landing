export const CONTACT_EMAIL = "hola@urbsdata.com";
export const CAREERS_EMAIL = "careers@urbsdata.com";

type ContactEmailOptions = {
  to?: string;
  subject: string;
  body: string;
};

export function buildContactEmailHref({
  to = CONTACT_EMAIL,
  subject,
  body,
}: ContactEmailOptions) {
  const params = [
    ["subject", subject],
    ["body", body],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `mailto:${to}?${params}`;
}
