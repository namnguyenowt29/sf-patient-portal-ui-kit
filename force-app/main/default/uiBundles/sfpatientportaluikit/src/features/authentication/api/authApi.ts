import { createDataSDK } from "@salesforce/platform-sdk";
import { parseAuthResponse, type AuthSuccess, isRecord } from "../authHelpers";
import { ApiError, handleApiResponse } from "../utils/helpers";

const GENERIC_AUTH_ERROR = "We couldn't complete your request. Please try again.";

type LoginRequest = Readonly<{ email: string; password: string; startUrl: string }>;
type RegistrationRequest = Readonly<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  startUrl: string;
}>;

export type ExternalSession = Readonly<{
  authenticated: boolean;
  user: Readonly<{ id: string; name: string }> | null;
}>;

async function fetchFromAuthEndpoint(path: string, init: RequestInit): Promise<unknown> {
  const sdk = await createDataSDK();
  if (!sdk.fetch) {
    throw new Error("Salesforce data access is unavailable.");
  }
  const response = await sdk.fetch(path, init);
  return handleApiResponse(response);
}

function authHeaders(): HeadersInit {
  return { Accept: "application/json", "Content-Type": "application/json" };
}

function expectAuthSuccess(value: unknown): AuthSuccess {
  const result = parseAuthResponse(value);
  if (result.success) return result;
  throw new ApiError(result.errors);
}

export async function registerPatient(request: RegistrationRequest): Promise<AuthSuccess> {
  return expectAuthSuccess(
    await fetchFromAuthEndpoint("/services/apexrest/auth/register", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ request }),
    })
  );
}

export async function loginPatient(request: LoginRequest): Promise<AuthSuccess> {
  return expectAuthSuccess(
    await fetchFromAuthEndpoint("/services/apexrest/auth/login", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(request),
    })
  );
}

export async function fetchExternalSession(): Promise<ExternalSession> {
  const value = await fetchFromAuthEndpoint("/services/apexrest/auth/session", { method: "GET" });
  if (!isRecord(value) || typeof value.authenticated !== "boolean") {
    throw new Error(GENERIC_AUTH_ERROR);
  }
  if (!value.authenticated) return { authenticated: false, user: null };
  if (typeof value.userId !== "string" || typeof value.name !== "string") {
    throw new TypeError(GENERIC_AUTH_ERROR);
  }
  return { authenticated: true, user: { id: value.userId, name: value.name } };
}
