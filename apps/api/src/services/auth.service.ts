import { db, users } from "../db"
import type { z } from "zod"
import { registerSchema, loginSchema } from "../db"
import { eq } from "drizzle-orm"
import { AppError } from "../lib/response";
import { StatusCodes } from "http-status-codes";
import { hashPassword, revokeAllUserTokens, rotateRefreshToken, saveRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";
import { token } from "morgan";
import bcrypt from "bcryptjs";



export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));


// ─────────────────────────────────────────────
// Strip passwordHash before returning user
// ─────────────────────────────────────────────
function safeUser(user: typeof users.$inferSelect) {
  const { password, ...safeUser } = user;
  return safeUser;
}


// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export async function register(input: RegisterInput) {
  //check duplicate email
  const [existing] = await db.select().from(users).where(
    eq(users.email, input.email)
  ).limit(1)

  if (existing)
    throw new AppError("Email already in use", StatusCodes.CONFLICT)

  const hashedPassword = await hashPassword(input.password)

  const [newUser] = await db.insert(users).values({
    email: input.email.toLocaleLowerCase(),
    password: hashedPassword,
    role: "customer",
    isActive: input.isActive ?? true,
  }).returning()
  if (!newUser)
    throw new AppError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR)

  // Issue token pair immediately after registration
  return issueTokenPair(newUser)
}

//________________________
// LOGIN
//________________________
export async function login(input: LoginInput) {
  // fetch user 
  const [user] = await db.select().from(users).where(
    eq(users.email, input.email.toLowerCase())
  ).limit(1)

  // check password
  const passwordMatch = await bcrypt.compare(input.password, user?.password ?? "")

  //constant-time guard - don't reveal whether email exists
  if (!user || passwordMatch === false) {
    await sleep(2000) // time guard
    throw new AppError("Invalid credentials", StatusCodes.UNAUTHORIZED)
  }

  if (!user.isActive)
    throw new AppError("User is inactive", StatusCodes.FORBIDDEN)

  // Issue token pair immediately after login
  return issueTokenPair(user)
}


// ─────────────────────────────────────────────
// REFRESH — rotate token pair
// ─────────────────────────────────────────────
export async function refresh(rawRefreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError("Invalid or Expired refresh token", StatusCodes.UNAUTHORIZED)
  }

  const result = await rotateRefreshToken(rawRefreshToken, payload.sub);
  if (!result)
    throw new AppError("Refresh token not found or expired ", StatusCodes.UNAUTHORIZED)

  // fetch user to rebuild accurate access token payload
  const [user] = await db.select().from(users).where(
    eq(users.id, payload.sub)
  ).limit(1)
  if (!user || !user.isActive)
    throw new AppError("Account not found or inactive", StatusCodes.UNAUTHORIZED)

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role
  })
  return { accessToken, refreshToken: result.refreshToken, user: safeUser(user) }
}

//__________________________________
// LOGOUT - revoke all refresh tokensfor user
//__________________________________
export async function logout(userId: number) {
  await revokeAllUserTokens(userId)
}

//__________________________________
// INTERNAL - build and persist token pair
//__________________________________
async function issueTokenPair(user: typeof users.$inferSelect) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role
  })
  const refreshToken = signRefreshToken({ sub: user.id, jti })
  await saveRefreshToken(user.id, refreshToken);

  return { accessToken, refreshToken, user: safeUser(user) }
}
