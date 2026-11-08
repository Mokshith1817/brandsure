import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env.local first, fallback to .env
if (fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const embeddingModelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  console.error('   Please configure your .env.local file with valid Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let genAI: GoogleGenerativeAI | null = null;
if (geminiApiKey && geminiApiKey !== 'your-google-gemini-api-key') {
  genAI = new GoogleGenerativeAI(geminiApiKey);
} else {
  console.warn('⚠️ GEMINI_API_KEY is not set. Guidelines will be chunked without vector embeddings.');
}

async function getEmbedding(text: string): Promise<number[] | null> {
  if (!genAI) return null;
  try {
    const model = genAI.getGenerativeModel({ model: embeddingModelName });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err: any) {
    console.error(`   [Embedding Error for "${text.slice(0, 30)}..."]:`, err.message);
    return null;
  }
}

function chunkGuidelineText(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const rawParts = text
    .split(/\n\s*\n|(?=(?:^|\n)\s*\d+\.\s+)/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks: string[] = [];
  for (const part of rawParts) {
    const words = part.split(/\s+/);
    if (words.length <= 130) {
      chunks.push(part);
    } else {
      for (let i = 0; i < words.length; i += 80) {
        const subChunk = words.slice(i, i + 80).join(' ');
        if (subChunk.trim().length > 0) chunks.push(subChunk.trim());
      }
    }
  }
  return chunks.length > 0 ? chunks : [text.trim()];
}

const JUDGE_USERS = [
  {
    email: process.env.JUDGE_CREATOR_EMAIL || 'creator@example.com',
    password: process.env.JUDGE_CREATOR_PASSWORD || 'PayNestCreator2026#Secure',
    full_name: 'PayNest Creator',
    role: 'creator',
  },
  {
    email: process.env.JUDGE_REVIEWER_EMAIL || 'reviewer@example.com',
    password: process.env.JUDGE_REVIEWER_PASSWORD || 'PayNestReviewer2026#Secure',
    full_name: 'PayNest Reviewer',
    role: 'reviewer',
  },
  {
    email: process.env.JUDGE_MANAGER_EMAIL || 'manager@example.com',
    password: process.env.JUDGE_MANAGER_PASSWORD || 'PayNestManager2026#Secure',
    full_name: 'PayNest Compliance Manager',
    role: 'manager',
  },
  {
    email: process.env.JUDGE_ADMIN_EMAIL || 'admin@example.com',
    password: process.env.JUDGE_ADMIN_PASSWORD || 'PayNestAdmin2026#Secure',
    full_name: 'PayNest Brand Admin',
    role: 'admin',
  },
];

async function seed() {
  console.log('🚀 Starting BrandSure Database Seeding for PayNest...\n');

  // 1. Ensure Organisation exists
  console.log('🏢 [1/5] Ensuring organization "PayNest" exists...');
  let orgId: string;
  const { data: existingOrg, error: orgFindError } = await supabase
    .from('organisations')
    .select('id, name')
    .eq('name', 'PayNest')
    .maybeSingle();

  if (orgFindError) {
    console.error('❌ Failed to query organisations table:', orgFindError.message);
    process.exit(1);
  }

  if (existingOrg) {
    orgId = existingOrg.id;
    console.log(`   Found existing organization: PayNest (${orgId})`);
  } else {
    const { data: newOrg, error: orgCreateError } = await supabase
      .from('organisations')
      .insert({ name: 'PayNest' })
      .select('id, name')
      .single();

    if (orgCreateError || !newOrg) {
      console.error('❌ Failed to create organisation "PayNest":', orgCreateError?.message);
      process.exit(1);
    }
    orgId = newOrg.id;
    console.log(`   Created organization: PayNest (${orgId})`);
  }

  // 2. Provision Demo Users in Supabase Auth & Profiles
  console.log('\n👥 [2/5] Provisioning demo users and profiles...');
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Failed to list Supabase auth users:', listError.message);
    process.exit(1);
  }

  for (const userDef of JUDGE_USERS) {
    let authUserId: string;
    const existing = authUsers.users.find((u) => u.email?.toLowerCase() === userDef.email.toLowerCase());

    if (existing) {
      authUserId = existing.id;
      // Update password and metadata to guarantee sync
      await supabase.auth.admin.updateUserById(authUserId, {
        password: userDef.password,
        email_confirm: true,
        user_metadata: { full_name: userDef.full_name, role: userDef.role },
      });
      console.log(`   ✓ Updated Auth User: ${userDef.email} (${userDef.role})`);
    } else {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: userDef.email,
        password: userDef.password,
        email_confirm: true,
        user_metadata: { full_name: userDef.full_name, role: userDef.role },
      });

      if (createError || !created.user) {
        console.error(`   ❌ Failed to create user ${userDef.email}:`, createError?.message);
        continue;
      }
      authUserId = created.user.id;
      console.log(`   ✓ Created Auth User: ${userDef.email} (${userDef.role})`);
    }

    // Upsert Profile
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authUserId,
        org_id: orgId,
        full_name: userDef.full_name,
        role: userDef.role,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error(`   ❌ Failed to upsert profile for ${userDef.email}:`, profileError.message);
    }
  }

  // 3. Load Seed Data from rulebook.json
  const rulebookPath = path.resolve(process.cwd(), 'seed/rulebook.json');
  if (!fs.existsSync(rulebookPath)) {
    console.error(`❌ rulebook.json not found at: ${rulebookPath}`);
    process.exit(1);
  }
  const rulebook = JSON.parse(fs.readFileSync(rulebookPath, 'utf8'));

  // 4. Seed Facts
  console.log(`\n📊 [3/5] Seeding ${rulebook.facts.length} approved facts...`);
  for (const fact of rulebook.facts) {
    const { error: factError } = await supabase.from('facts').upsert(
      {
        org_id: orgId,
        key: fact.key,
        statement: fact.statement,
        value: fact.value,
        unit: fact.unit,
        as_of: fact.as_of,
        source_note: fact.source_note,
      },
      { onConflict: 'org_id,key' }
    );

    if (factError) {
      console.error(`   ❌ Failed to upsert fact "${fact.key}":`, factError.message);
    } else {
      console.log(`   ✓ Fact: ${fact.key} (${fact.value} ${fact.unit})`);
    }
  }

  // 5. Seed Guidelines + Vector Chunks
  console.log(`\n📜 [4/5] Seeding ${rulebook.guidelines.length} brand guidelines with chunk embeddings...`);
  let totalChunks = 0;
  let totalEmbedded = 0;

  for (const g of rulebook.guidelines) {
    // Upsert guideline
    const { data: gData, error: gError } = await supabase
      .from('guidelines')
      .upsert(
        {
          org_id: orgId,
          key: g.id,
          title: g.title,
          text: g.text,
          category: g.category,
        },
        { onConflict: 'org_id,key' }
      )
      .select('id')
      .single();

    if (gError || !gData) {
      console.error(`   ❌ Failed to upsert guideline "${g.id}":`, gError?.message);
      continue;
    }

    const guidelineDbId = gData.id;

    // Delete existing chunks for this guideline
    await supabase.from('guideline_chunks').delete().eq('guideline_id', guidelineDbId);

    // Chunk and generate embeddings
    const chunks = chunkGuidelineText(g.text);
    totalChunks += chunks.length;

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      if (embedding) totalEmbedded++;

      await supabase.from('guideline_chunks').insert({
        guideline_id: guidelineDbId,
        org_id: orgId,
        content: chunk,
        embedding: embedding || null,
      });
    }

    console.log(`   ✓ Guideline: ${g.id} (${chunks.length} chunks)`);
  }
  console.log(`   Total Chunks Created: ${totalChunks} (Vectorized with Gemini: ${totalEmbedded})`);

  // 6. Seed Glossary
  console.log(`\n📖 [5/5] Seeding ${rulebook.glossary.length} glossary entries...`);
  for (const item of rulebook.glossary) {
    const { error: glossError } = await supabase.from('glossary').upsert(
      {
        org_id: orgId,
        preferred: item.preferred,
        banned: item.banned,
        note: item.note,
      },
      { onConflict: 'org_id,preferred' }
    );

    if (glossError) {
      console.error(`   ❌ Failed to upsert glossary "${item.preferred}":`, glossError.message);
    } else {
      console.log(`   ✓ Term: "${item.preferred}" (Banned: ${item.banned.join(', ')})`);
    }
  }

  // 7. Write Audit Log Entry
  await supabase.from('audit_log').insert({
    org_id: orgId,
    actor_id: null,
    actor_type: 'system',
    action: 'database_seeded',
    entity_type: 'organisation',
    entity_id: orgId,
    detail: {
      facts_count: rulebook.facts.length,
      guidelines_count: rulebook.guidelines.length,
      chunks_count: totalChunks,
      embedded_chunks: totalEmbedded,
      glossary_count: rulebook.glossary.length,
    },
  });

  // Query row counts
  const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: guidelinesCount } = await supabase.from('guidelines').select('*', { count: 'exact', head: true });
  const { count: factsCount } = await supabase.from('facts').select('*', { count: 'exact', head: true });
  const { count: glossaryCount } = await supabase.from('glossary').select('*', { count: 'exact', head: true });

  console.log('\n=============================================================');
  console.log('✅ PayNest Database Seeding Completed Successfully!');
  console.log('=============================================================');
  console.log('Database Row Counts:');
  console.log(` - Profiles   : ${profilesCount ?? 0}`);
  console.log(` - Guidelines : ${guidelinesCount ?? 0} (${totalChunks} chunks, ${totalEmbedded} embedded)`);
  console.log(` - Facts      : ${factsCount ?? 0}`);
  console.log(` - Glossary   : ${glossaryCount ?? 0}`);
  console.log('-------------------------------------------------------------');
  console.log('Configured Judge User Accounts (passwords kept in environment):');
  JUDGE_USERS.forEach((u) => {
    console.log(` - [${u.role.toUpperCase()}] ${u.email}`);
  });
  console.log('=============================================================\n');
}

seed().catch((err) => {
  console.error('\n❌ Unexpected error during seeding:', err);
  process.exit(1);
});
