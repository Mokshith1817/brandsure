import crypto from 'node:crypto';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'brandsure-secure-session-signing-secret-key-2026-paynest-governance';
const DEMO_ORG_ID = 'org-paynest-demo';

function createSignedCookie(payload) {
  const now = payload.iat ?? Date.now();
  const expiresInMs = payload.expiresInMs ?? 7 * 24 * 60 * 60 * 1000;
  const exp = payload.exp ?? (now + expiresInMs);
  const fullPayload = {
    email: payload.email,
    role: payload.role,
    full_name: payload.full_name,
    org_id: payload.org_id,
    iat: now,
    exp,
  };
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadB64);
  const sigB64 = hmac.digest('base64url');
  return `${payloadB64}.${sigB64}`;
}

async function main() {
  console.log('='.repeat(72));
  console.log('BrandSure Phase 2: Role Security & Tamper Test Runner');
  console.log(`Target: ${BASE_URL}`);
  console.log('='.repeat(72));

  let passed = 0;
  let failed = 0;

  function report(name, isPass, detail) {
    if (isPass) {
      console.log(`[PASS] ${name}`);
      console.log(`       Evidence: ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      console.error(`       Failure Detail: ${detail}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Test 1: Tampered Session Cookie (Escalating role to manager)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 1: Role Escalation Cookie Tampering ---');
  try {
    // Legitimate creator cookie
    const validCreatorToken = createSignedCookie({
      role: 'creator',
      email: 'priya@paynest.demo',
      full_name: 'Priya Sharma',
      org_id: DEMO_ORG_ID,
    });
    const [payloadB64, sigB64] = validCreatorToken.split('.');
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    // Attacker modifies role in cookie payload
    decoded.role = 'manager';
    decoded.full_name = 'Attacker As Manager';
    const tamperedPayloadB64 = Buffer.from(JSON.stringify(decoded)).toString('base64url');
    const tamperedCookie = `${tamperedPayloadB64}.${sigB64}`;

    const res = await fetch(`${BASE_URL}/approvals`, {
      headers: {
        Cookie: `brandsure_demo_session=${tamperedCookie}`,
      },
      redirect: 'manual',
    });

    const body = await res.text();
    // Tampered cookie fails HMAC validation -> session null -> 401 Unauthorized
    const isPass = (res.status === 401 || res.status === 403) && res.status !== 200 && res.status !== 500;
    report(
      'Tamper 1: Creator tampering role cookie to "manager" requesting /approvals',
      isPass,
      `HTTP status ${res.status} (Expected 401/403). Response: ${body.slice(0, 80).replace(/\n/g, ' ')}`
    );
  } catch (err) {
    report('Tamper 1: Cookie role tampering', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Test 2: Role Privilege Enforcement (Reviewer attempting Manager/Admin)
  // -------------------------------------------------------------------------
  console.log('\n--- Test 2: Reviewer Forbidden from Approvals & Admin ---');
  try {
    const reviewerToken = createSignedCookie({
      role: 'reviewer',
      email: 'marcus@paynest.demo',
      full_name: 'Marcus Vance',
      org_id: DEMO_ORG_ID,
    });

    // Reviewer accessing /approvals
    const resApprovals = await fetch(`${BASE_URL}/approvals`, {
      headers: {
        Cookie: `brandsure_demo_session=${reviewerToken}`,
      },
      redirect: 'manual',
    });
    const bodyApprovals = await resApprovals.text();
    const approvalsForbidden = resApprovals.status === 403;

    // Reviewer accessing /admin/guidelines
    const resAdmin = await fetch(`${BASE_URL}/admin/guidelines`, {
      headers: {
        Cookie: `brandsure_demo_session=${reviewerToken}`,
      },
      redirect: 'manual',
    });
    const bodyAdmin = await resAdmin.text();
    const adminForbidden = resAdmin.status === 403;

    const isPass = approvalsForbidden && adminForbidden;
    report(
      'Tamper 2: Reviewer attempting manager/admin actions (/approvals & /admin)',
      isPass,
      `/approvals returned HTTP ${resApprovals.status} (Expected 403); /admin returned HTTP ${resAdmin.status} (Expected 403)`
    );
  } catch (err) {
    report('Tamper 2: Reviewer privilege check', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Test 3: Creator Draft Isolation
  // -------------------------------------------------------------------------
  console.log('\n--- Test 3: Creator A Requesting Creator B Draft ---');
  try {
    // Creator B ('demo-creatorB') attempts to access Creator A's draft ('draft-demo-1')
    const creatorBToken = createSignedCookie({
      role: 'creator',
      email: 'maya@paynest.demo',
      full_name: 'Maya Patel (Creator B)',
      org_id: DEMO_ORG_ID,
    });

    const resDraft = await fetch(`${BASE_URL}/drafts/draft-demo-1`, {
      headers: {
        Cookie: `brandsure_demo_session=${creatorBToken}`,
        Accept: 'text/html',
      },
      redirect: 'manual',
    });

    const html = await resDraft.text();
    const has403Denied = html.includes('Access Denied (403 Forbidden)') || html.includes('403 Forbidden');
    const hasDraftContent = html.includes('Instant 10% cashback on all UPI transfers');

    const isPass = resDraft.status === 403 && has403Denied && !hasDraftContent;
    report(
      'Tamper 3: Creator B accessing Creator A draft (/drafts/draft-demo-1)',
      isPass,
      `HTTP status ${resDraft.status} (Expected 403); 403 Access Denied rendered (${has403Denied}); draft copy hidden (${!hasDraftContent})`
    );
  } catch (err) {
    report('Tamper 3: Creator draft isolation', false, err.message);
  }

  // -------------------------------------------------------------------------
  // Test 4: Unauthenticated Visitor Rejection
  // -------------------------------------------------------------------------
  console.log('\n--- Test 4: Logged-out Visitor Accessing Protected Endpoints ---');
  const protectedRoutes = ['/audit', '/approvals', '/rules', '/drafts'];
  let allUnauthBlocked = true;
  const unauthDetails = [];

  for (const route of protectedRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, {
        headers: {
          Accept: '*/*',
        },
        redirect: 'manual',
      });
      const isBlocked = (res.status === 401 || res.status === 403) && res.status !== 200 && res.status !== 500;
      if (!isBlocked) allUnauthBlocked = false;
      unauthDetails.push(`${route}: HTTP ${res.status}`);
    } catch (err) {
      allUnauthBlocked = false;
      unauthDetails.push(`${route}: Error ${err.message}`);
    }
  }

  report(
    'Tamper 4: Logged-out visitor requesting /audit, /approvals, /rules, /drafts',
    allUnauthBlocked,
    unauthDetails.join(', ')
  );

  // -------------------------------------------------------------------------
  // Test 5: Expired Token Replay & Malformed Token Rejection
  // -------------------------------------------------------------------------
  console.log('\n--- Test 5: Replay of Expired and Malformed Tokens ---');
  try {
    const expiredToken = createSignedCookie({
      role: 'manager',
      email: 'elena@paynest.demo',
      full_name: 'Elena Rostova',
      org_id: DEMO_ORG_ID,
      exp: Date.now() - 3600 * 1000, // 1 hour ago
    });

    const resExpired = await fetch(`${BASE_URL}/approvals`, {
      headers: {
        Cookie: `brandsure_demo_session=${expiredToken}`,
      },
      redirect: 'manual',
    });

    const resGarbage = await fetch(`${BASE_URL}/approvals`, {
      headers: {
        Cookie: 'brandsure_demo_session=random_untrusted_session_data',
      },
      redirect: 'manual',
    });

    const expiredBlocked = (resExpired.status === 401 || resExpired.status === 403) && resExpired.status !== 200 && resExpired.status !== 500;
    const garbageBlocked = (resGarbage.status === 401 || resGarbage.status === 403) && resGarbage.status !== 200 && resGarbage.status !== 500;

    const isPass = expiredBlocked && garbageBlocked;
    report(
      'Tamper 5: Replaying expired token (exp in past) and malformed cookie',
      isPass,
      `Expired token: HTTP ${resExpired.status}; Malformed token: HTTP ${resGarbage.status}`
    );
  } catch (err) {
    report('Tamper 5: Expired token replay', false, err.message);
  }

  console.log('\n' + '='.repeat(72));
  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of 5 tamper tests.`);
  console.log('='.repeat(72));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error running tamper tests:', err);
  process.exit(1);
});
