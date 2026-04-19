import jwt from "jsonwebtoken"
import crypto from "crypto"
import { db } from "../db";
import { eq, and, lt } from "drizzle-orm";
import { refreshTokens } from "../db";
import bcrypt from "bcryptjs";

const ACCESS_SECRET = process.env.ACCESS_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export const TOKEN_TTL = {
  access: "3h",
  access_ms: 1000 * 60 * 60 * 3,
  refreshDays: "30d",
  refresh_ms: 1000 * 60 * 60 * 24 * 30
} as const;

// __________________________
// Payload Types
// __________________________
export interface Access_Payload {
  sub: number, // user ID
  email: string,
  role: "customer" | "admin"
}

export interface Refresh_Payload {
  sub: number,
  jti: string,  // unique token ID to allow revocation
}

//____________________________________
// Sign Tokens
//____________________________________
export function signAccessToken(payload: Access_Payload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: TOKEN_TTL.access });
}

export function signRefreshToken(payload: Refresh_Payload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: TOKEN_TTL.refreshDays });
}


//______________________________________
// Verify Tokens
//______________________________________
export function verifyAccessToken(token: string): Access_Payload {
  return jwt.verify(token, ACCESS_SECRET) as unknown as Access_Payload;
}

export function verifyRefreshToken(token: string): Refresh_Payload {
  return jwt.verify(token, REFRESH_SECRET) as unknown as Refresh_Payload;
}

// ─────────────────────────────────────────────
// Refresh token DB helpers
// (stored as hash — never raw token in DB)
// ─────────────────────────────────────────────
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function saveRefreshToken(userId: number, token: string): Promise<void> {
  const expiredAt = new Date(Date.now() + TOKEN_TTL.refresh_ms);
  const hashedToken = hashToken(token);
  console.log(hashToken);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashedToken,
    expiredAt,
  })
}

export async function rotateRefreshToken(oldToken: string, userId: number)
  : Promise<{ accessToken: string, refreshToken: string } | null> {
  const hashedToken = hashToken(oldToken);

  // verify old token exist or not expired
  const [stored] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashedToken))
    .limit(1)

  if (!stored
    || stored.userId !== userId
    || stored.expiredAt < new Date()
  )
    return null;

  // delete old token - (rotation means one-time-use)
  await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.tokenHash, hashedToken))

  // Issue new pair
  const jti = crypto.randomUUID();
  // const accessToken = signAccessToken({ sub: userId, email: stored.email, role: stored.role });
  const accessToken = signAccessToken({ sub: userId, email: "", role: "customer" });
  const newRefreshToken = signRefreshToken({ sub: userId, jti });
  await saveRefreshToken(userId, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken }
}

export async function revokeAllUserTokens(userId: number): Promise<void> {
  await db.delete(refreshTokens)
    .where(eq(refreshTokens.userId, userId))
}

export async function pruneExpiredTokens(): Promise<void> {
  await db.delete(refreshTokens)
    .where(lt(refreshTokens.expiredAt, new Date()))
}

// ______________________________________
// Password Helpers
// ______________________________________
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}