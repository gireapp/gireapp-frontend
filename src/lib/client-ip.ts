import { CLIENT_IP_HEADERS } from "@gireapp/shared";

/**
 * Headers that tell the backend which learner a server-side call is for.
 * Every learner's requests reach the backend from this server, so without
 * them the backend's per-IP rate limits would treat all learners as one.
 *
 * Reads the first `x-forwarded-for` entry, which Vercel overwrites with the
 * connecting client's address — a value a visitor cannot forge there. On a
 * host that appends to the header instead, this would need revisiting.
 */
export function clientIpHeaders(
  incoming: Headers,
  secret: string | undefined,
): Record<string, string> {
  if (!secret) return {};

  const clientIp =
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    incoming.get("x-real-ip")?.trim();
  if (!clientIp) return {};

  return {
    [CLIENT_IP_HEADERS.IP]: clientIp,
    [CLIENT_IP_HEADERS.SECRET]: secret,
  };
}
