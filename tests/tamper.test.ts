import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import {
  createSignedSessionCookie,
  verifySignedSessionCookie,
  type DemoSessionPayload,
} from '@/lib/session';
import { recordDecision, createNewVersion } from '@/app/actions/collaboration';
import { updateFindingDisposition, submitDraftForReview } from '@/app/actions/drafts';
import { DEMO_PROFILES, DEMO_ORG } from '@/lib/demo-data';

describe('Phase 2: Authentication and Role Security Tamper Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    (process.env as any).NODE_ENV = 'development';
    process.env.DEMO_MODE = 'true';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ---------------------------------------------------------------------------
  // Test 1: Tampered Cookie Rejection
  // ---------------------------------------------------------------------------
  it('Tamper 1: rejects tampered session cookie modifying role to manager', async () => {
    // 1. Generate a legitimate creator session token
    const legitimateCreator = {
      role: 'creator' as const,
      email: 'priya@paynest.demo',
      full_name: 'Priya Sharma',
      org_id: DEMO_ORG.id,
    };
    const validToken = await createSignedSessionCookie(legitimateCreator);
    expect(validToken).toBeTruthy();

    const [payloadB64, signature] = validToken.split('.');
    expect(payloadB64).toBeDefined();
    expect(signature).toBeDefined();

    // 2. Attacker modifies payload to claim manager privileges without knowing secret
    const decodedJson = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    decodedJson.role = 'manager';
    decodedJson.full_name = 'Attacker Manager';
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(decodedJson)).toString('base64url');

    // Reassemble token with forged payload and original signature
    const tamperedToken = `${tamperedPayloadB64}.${signature}`;

    // 3. Cryptographic verification must reject tampered token
    const verified = await verifySignedSessionCookie(tamperedToken);
    expect(verified).toBeNull();

    // 4. Verification in middleware must reject request with 401/403
    const req = new NextRequest('http://localhost:3000/approvals', {
      headers: {
        cookie: `brandsure_demo_session=${tamperedToken}`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(401);
  });

  // ---------------------------------------------------------------------------
  // Test 2: Role Privilege Enforcement (Reviewer attempting Manager action)
  // ---------------------------------------------------------------------------
  it('Tamper 2: reviewer is forbidden from approving/rejecting drafts', async () => {
    const legitimateReviewer = {
      role: 'reviewer' as const,
      email: 'marcus@paynest.demo',
      full_name: 'Marcus Vance',
      org_id: DEMO_ORG.id,
    };
    const reviewerToken = await createSignedSessionCookie(legitimateReviewer);

    // Middleware restricts reviewer from /approvals queue
    const req = new NextRequest('http://localhost:3000/approvals', {
      headers: {
        cookie: `brandsure_demo_session=${reviewerToken}`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(403);

    // Middleware restricts reviewer from /admin routes
    const adminReq = new NextRequest('http://localhost:3000/admin/guidelines', {
      headers: {
        cookie: `brandsure_demo_session=${reviewerToken}`,
      },
    });
    const adminRes = await middleware(adminReq);
    expect(adminRes.status).toBe(403);
  });

  // ---------------------------------------------------------------------------
  // Test 3: Creator Draft Isolation (Creator A accessing Creator B's draft)
  // ---------------------------------------------------------------------------
  it('Tamper 3: Creator A is forbidden from modifying or submitting Creator B draft', async () => {
    // Draft-demo-1 is owned by 'demo-creator' (Priya)
    // Create session for Creator B ('demo-creatorB' / Maya)
    const creatorBToken = await createSignedSessionCookie({
      role: 'creator',
      email: 'maya@paynest.demo',
      full_name: 'Maya Patel (Creator B)',
      org_id: DEMO_ORG.id,
    });

    // Valid token for Creator B
    const verifiedB = await verifySignedSessionCookie(creatorBToken);
    expect(verifiedB).not.toBeNull();
    expect(verifiedB?.role).toBe('creator');

    // Middleware rejects Creator B requesting Creator A's draft with 403
    const req = new NextRequest('http://localhost:3000/drafts/draft-demo-1', {
      headers: {
        cookie: `brandsure_demo_session=${creatorBToken}`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(403);
  });

  // ---------------------------------------------------------------------------
  // Test 4: Logged-out Visitor Rejection
  // ---------------------------------------------------------------------------
  it('Tamper 4: unauthenticated visitor cannot access protected endpoints (/audit, /approvals, /rules, /drafts)', async () => {
    const protectedRoutes = ['/audit', '/approvals', '/rules', '/drafts'];

    for (const route of protectedRoutes) {
      const req = new NextRequest(`http://localhost:3000${route}`);
      const res = await middleware(req);
      // Non-HTML / automated request receives 401 Unauthorized
      expect(res.status).toBe(401);
    }
  });

  // ---------------------------------------------------------------------------
  // Test 5: Expired Token Replay Rejection
  // ---------------------------------------------------------------------------
  it('Tamper 5: rejects replayed expired tokens and malformed signatures', async () => {
    // Token that expired 1 hour ago
    const expiredPayload = {
      role: 'manager' as const,
      email: 'elena@paynest.demo',
      full_name: 'Elena Rostova',
      org_id: DEMO_ORG.id,
      exp: Date.now() - 3600 * 1000,
    };
    const expiredToken = await createSignedSessionCookie(expiredPayload);

    const verifiedExpired = await verifySignedSessionCookie(expiredToken);
    expect(verifiedExpired).toBeNull();

    // Replay of expired token in middleware
    const req = new NextRequest('http://localhost:3000/approvals', {
      headers: {
        cookie: `brandsure_demo_session=${expiredToken}`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(401);

    // Garbage token
    const garbageReq = new NextRequest('http://localhost:3000/approvals', {
      headers: {
        cookie: 'brandsure_demo_session=invalid.token.structure',
      },
    });
    const garbageRes = await middleware(garbageReq);
    expect(garbageRes.status).toBe(401);
  });
});
