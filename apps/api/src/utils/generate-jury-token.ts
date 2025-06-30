import { SignJWT } from "jose";
const MAX_EXPIRY_DAYS = 90;

export async function generateJuryToken(
  domain: string,
  invitationId: number
): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JURY_JWT_SECRET);
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * MAX_EXPIRY_DAYS;

  const payload = {
    domain,
    invitationId,
    iat,
    exp,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(secret);
}
