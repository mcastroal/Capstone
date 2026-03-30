import jwt from "jsonwebtoken";

/**
 * @param {Request} request
 * @returns {{ id: number; role: string } | null}
 */
export function getAuthPayload(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload?.id == null) return null;
    return { id: Number(payload.id), role: String(payload.role ?? "") };
  } catch {
    return null;
  }
}
