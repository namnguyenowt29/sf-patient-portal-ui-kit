import { AUTH_REDIRECT_PARAM } from "./authenticationConfig";
import { z } from "zod";

/** Email field validation */
export const emailSchema = z.email("Please enter a valid email address");

/** Password field validation (minimum 8 characters) */
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

/**
 * Shared schema for new password + confirmation fields.
 * Validates password length and matching confirmation.
 */
export const newPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 *
 * Extracts the startUrl from URLSearchParams, defaulting to '/'.
 *
 * SECURITY NOTE: This function strictly validates the URL to prevent
 * Open Redirect vulnerabilities. It allows only relative paths.
 *
 * @param searchParams - The URLSearchParams object from useSearchParams()
 * @returns The start URL for post-authentication redirect
 */
export function getStartUrl(searchParams: URLSearchParams): string {
  return getSafeStartUrl(searchParams.get(AUTH_REDIRECT_PARAM));
}

/**
 * [Dev Note] Security: Validates that the redirect URL is a relative path
 * to prevent Open Redirect vulnerabilities.
 *
 * Security Checks:
 * 1. Rejects protocol-relative URLs (//)
 * 2. Rejects backslash usage which some browsers treat as slashes (/\)
 * 3. Rejects control characters
 */
export function getSafeStartUrl(url: string | null | undefined): string {
  if (!url || url === "/") return "/";

  let decoded = url;
  try {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) break;
      decoded = nextValue;
    }
  } catch {
    return "/";
  }

  if (
    decoded.includes("%") ||
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    decoded.includes("@") ||
    decoded.includes(":") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return "/";
  }

  const path = decoded.split(/[?#]/, 1)[0];
  if (path.split("/").some((segment) => segment === "." || segment === "..")) {
    return "/";
  }

  return decoded;
}

/**
 * Shared response type for authentication endpoints (login/register).
 * Success responses contain `success: true` and `redirectUrl`.
 * Error responses contain `errors` array.
 */
export type AuthSuccess = Readonly<{ success: true; redirectUrl: string }>;
export type AuthFailure = Readonly<{ success: false; errors: string[] }>;
export type AuthResponse = AuthSuccess | AuthFailure;

export function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value)) {
    throw new Error("The sign-in service returned an invalid response.");
  }
  if (value.success === true && typeof value.redirectUrl === "string" && value.redirectUrl.length > 0) {
    return { success: true, redirectUrl: value.redirectUrl };
  }
  if (
    value.success === false &&
    Array.isArray(value.errors) &&
    value.errors.every((error) => typeof error === "string")
  ) {
    return { success: false, errors: value.errors };
  }
  throw new Error("The sign-in service returned an invalid response.");
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
