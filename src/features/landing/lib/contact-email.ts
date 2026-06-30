export const CONTACT_EMAIL = "hola@urbsdata.com";

type ContactEmailOptions = {
  subject: string;
  body: string;
};

export function buildContactEmailHref({ subject, body }: ContactEmailOptions) {
  const params = [
    ["subject", subject],
    ["body", body],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `mailto:${CONTACT_EMAIL}?${params}`;
}
