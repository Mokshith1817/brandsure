import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import {
  createSignedSessionCookie,
  verifySignedSessionCookie,
} from '@/lib/session';
import { signUpAction } from '@/app/actions/auth';
import { DEMO_PROFILES, DEMO_ORG } from '@/lib/demo-data';

describe('Phase 1 & 2: Authentication and Role Security Tamper Tests', () => {
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
  it('Tamper 1: rejects tampered session cookie modifying role or payload', async () => {
    // 1. Generate a legitimate creator session token
    const legitimateCreator = {
      userId: 'demo-creator',
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

    // 4. Verification in middleware must reject request with 401
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
  it('Tamper 2: reviewer is forbidden from approving/rejecting drafts and admin routes', async () => {
    // Register reviewer in server ground truth
    DEMO_PROFILES['marcus@paynest.demo'] = {
      role: 'reviewer',
      full_name: 'Marcus Vance',
    };

    const reviewerToken = await createSignedSessionCookie({
      userId: 'demo-marcus',
      email: 'marcus@paynest.demo',
      full_name: 'Marcus Vance',
      org_id: DEMO_ORG.id,
    });

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
  it('Tamper 3: Creator A is forbidden from viewing or modifying Creator B draft', async () => {
    // Draft-demo-1 is owned by 'demo-creator' (Priya)
    // Create session for Creator B ('demo-creatorB' / Maya)
    DEMO_PROFILES['maya@paynest.demo'] = {
      role: 'creator',
      full_name: 'Maya Patel (Creator B)',
    };

    const creatorBToken = await createSignedSessionCookie({
      userId: 'demo-creatorB',
      email: 'maya@paynest.demo',
      full_name: 'Maya Patel (Creator B)',
      org_id: DEMO_ORG.id,
    });

    // Valid token for Creator B
    const verifiedB = await verifySignedSessionCookie(creatorBToken);
    expect(verifiedB).not.toBeNull();

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
  // Test 5: Self Sign-up Cannot Set Its Own Role
  // ---------------------------------------------------------------------------
  it('Tamper 5: sign-up strictly assigns creator role and ignores client-submitted role=admin', async () => {
    const maliciousSignup = {
      fullName: 'Attacker Impersonator',
      email: 'attacker@paynest.demo',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      role: 'admin', // Malicious attempt to escalate role
    };

    const result = await signUpAction(maliciousSignup);
    expect(result.success).toBe(true);
    expect(result.redirect).toBe('/drafts'); // Redirects to creator workspace, not /rules

    // Verify role in server ground truth is strictly 'creator'
    const profile = DEMO_PROFILES['attacker@paynest.demo'];
    expect(profile).toBeDefined();
    expect(profile.role).toBe('creator'); // NOT 'admin'
  });
});
