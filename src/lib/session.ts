import type { Role } from '@/types/database';

export interface DemoSessionPayload {
  email: string;
  role: Role;
  full_name: string;
  org_id: string;
  iat: number;
  exp: number;
  userId?: string;
}

// Server-side secret for HMAC signing. In production, provide SESSION_SECRET.
// In local/demo mode, a persistent fallback key is used.
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'brandsure-secure-session-signing-secret-key-2026-paynest-governance';

const VALID_ROLES = new Set<Role>(['creator', 'reviewer', 'manager', 'admin']);

/**
 * Base64url encode a buffer or Uint8Array
 */
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64url decode to string
 */
function base64UrlToString(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Import the HMAC SHA-256 key using Web Crypto (compatible with Node and Edge runtimes)
 */
async function getHmacKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a cryptographically signed session token.
 * Format: `${base64urlPayload}.${signature}`
 */
export async function createSignedSessionCookie(
  payload: Partial<DemoSessionPayload> & {
    email: string;
    role: Role;
    full_name: string;
    org_id: string;
    expiresInMs?: number;
  }
): Promise<string> {
  const now = payload.iat ?? Date.now();
  const expiresInMs = payload.expiresInMs ?? 7 * 24 * 60 * 60 * 1000; // 7 days default
  const exp = payload.exp ?? (now + expiresInMs);

  const fullPayload: DemoSessionPayload = {
    email: payload.email,
    role: payload.role,
    full_name: payload.full_name,
    org_id: payload.org_id,
    iat: now,
    exp,
    ...(payload.userId ? { userId: payload.userId } : {}),
  };

  const enc = new TextEncoder();
  const jsonString = JSON.stringify(fullPayload);
  const payloadB64 = bufferToBase64Url(enc.encode(jsonString));

  const key = await getHmacKey();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = bufferToBase64Url(sigBuffer);

  return `${payloadB64}.${sigB64}`;
}

/**
 * Verifies and decodes a signed session token.
 * Returns the verified payload or null if tampered, malformed, or expired.
 */
export async function verifySignedSessionCookie(
  token: string | undefined | null
): Promise<DemoSessionPayload | null> {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) {
    return null;
  }

  try {
    const enc = new TextEncoder();
    const key = await getHmacKey();

    // Decode provided signature
    const sigBinary = base64UrlToString(sigB64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    // Verify HMAC signature in constant time
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      enc.encode(payloadB64)
    );

    if (!isValid) {
      console.warn('[Session Security Alert]: Cookie signature mismatch! Possible role tampering attempt detected.');
      return null;
    }

    // Decode payload
    const jsonString = base64UrlToString(payloadB64);
    const payload = JSON.parse(jsonString) as DemoSessionPayload;

    // Check expiration
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return null;
    }

    // Check role validity
    if (!payload.role || !VALID_ROLES.has(payload.role)) {
      return null;
    }

    // Check email
    if (!payload.email || typeof payload.email !== 'string') {
      return null;
    }

    return payload;
  } catch {
    // Malformed base64, JSON parse error, or signature decoding error
    return null;
  }
}
