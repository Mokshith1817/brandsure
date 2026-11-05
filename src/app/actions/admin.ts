'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getEmbedding, chunkGuidelineText } from '@/lib/embeddings';
import { writeAudit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized: Please log in.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id, role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin access required.');
  }

  return { user, profile };
}

// -------------------------------------------------------------------------
// Guidelines
// -------------------------------------------------------------------------

export async function saveGuideline(formData: {
  id?: string;
  key?: string;
  title: string;
  text: string;
  category: string;
}) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const title = formData.title.trim();
  const text = formData.text.trim();
  const category = formData.category.trim();
  const key = formData.key?.trim() || null;

  if (!title || !text || !category) {
    return { error: 'Title, text, and category are required.' };
  }

  let guidelineId = formData.id;

  if (guidelineId) {
    const { error } = await supabase
      .from('guidelines')
      .update({ title, text, category, ...(key ? { key } : {}) })
      .eq('id', guidelineId)
      .eq('org_id', profile.org_id);

    if (error) return { error: error.message };

    // Delete existing chunks for this guideline
    await serviceClient
      .from('guideline_chunks')
      .delete()
      .eq('guideline_id', guidelineId);
  } else {
    const { data, error } = await supabase
      .from('guidelines')
      .insert({
        org_id: profile.org_id,
        key,
        title,
        text,
        category,
      })
      .select('id')
      .single();

    if (error || !data) return { error: error?.message || 'Failed to create guideline.' };
    guidelineId = data.id;
  }

  // Chunking and embedding generation
  const chunks = chunkGuidelineText(text);
  let indexedWithEmbeddings = 0;

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    if (embedding) indexedWithEmbeddings++;

    await serviceClient.from('guideline_chunks').insert({
      guideline_id: guidelineId,
      org_id: profile.org_id,
      content: chunk,
      embedding: embedding || null,
    });
  }

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    formData.id ? 'guideline_updated' : 'guideline_created',
    { type: 'guideline', id: guidelineId! },
    { title, category, chunks_count: chunks.length, embedded_count: indexedWithEmbeddings }
  );

  revalidatePath('/admin/guidelines');
  revalidatePath('/rules');
  return { success: true, guidelineId, chunksCount: chunks.length, indexedWithEmbeddings };
}

export async function deleteGuideline(id: string) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('guidelines')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id);

  if (error) return { error: error.message };

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    'guideline_deleted',
    { type: 'guideline', id },
    {}
  );

  revalidatePath('/admin/guidelines');
  revalidatePath('/rules');
  return { success: true };
}

export async function reindexGuideline(id: string) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const { data: guideline, error } = await supabase
    .from('guidelines')
    .select('*')
    .eq('id', id)
    .eq('org_id', profile.org_id)
    .single();

  if (error || !guideline) return { error: error?.message || 'Guideline not found.' };

  // Delete existing chunks
  await serviceClient.from('guideline_chunks').delete().eq('guideline_id', id);

  const chunks = chunkGuidelineText(guideline.text);
  let indexedWithEmbeddings = 0;

  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    if (embedding) indexedWithEmbeddings++;

    await serviceClient.from('guideline_chunks').insert({
      guideline_id: id,
      org_id: profile.org_id,
      content: chunk,
      embedding: embedding || null,
    });
  }

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    'guideline_reindexed',
    { type: 'guideline', id },
    { chunks_count: chunks.length, embedded_count: indexedWithEmbeddings }
  );

  revalidatePath('/admin/guidelines');
  return { success: true, chunksCount: chunks.length, indexedWithEmbeddings };
}

// -------------------------------------------------------------------------
// Approved Facts
// -------------------------------------------------------------------------

export async function saveFact(formData: {
  id?: string;
  key: string;
  statement: string;
  value: string;
  unit: string;
  as_of: string;
  source_note?: string;
}) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();

  const key = formData.key.trim();
  const statement = formData.statement.trim();
  const value = formData.value.trim();
  const unit = formData.unit.trim();
  const as_of = formData.as_of.trim();
  const source_note = formData.source_note?.trim() || null;

  if (!key || !statement || !value || !unit || !as_of) {
    return { error: 'Key, statement, value, unit, and as-of date are required.' };
  }

  let factId = formData.id;

  if (factId) {
    const { error } = await supabase
      .from('facts')
      .update({ key, statement, value, unit, as_of, source_note })
      .eq('id', factId)
      .eq('org_id', profile.org_id);

    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from('facts')
      .insert({
        org_id: profile.org_id,
        key,
        statement,
        value,
        unit,
        as_of,
        source_note,
      })
      .select('id')
      .single();

    if (error || !data) return { error: error?.message || 'Failed to save fact.' };
    factId = data.id;
  }

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    formData.id ? 'fact_updated' : 'fact_created',
    { type: 'fact', id: factId! },
    { key, value, unit }
  );

  revalidatePath('/admin/facts');
  revalidatePath('/rules');
  return { success: true, factId };
}

export async function deleteFact(id: string) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('facts')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id);

  if (error) return { error: error.message };

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    'fact_deleted',
    { type: 'fact', id },
    {}
  );

  revalidatePath('/admin/facts');
  revalidatePath('/rules');
  return { success: true };
}

// -------------------------------------------------------------------------
// Glossary
// -------------------------------------------------------------------------

export async function saveGlossaryEntry(formData: {
  id?: string;
  preferred: string;
  banned: string[];
  note?: string;
}) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();

  const preferred = formData.preferred.trim();
  const banned = formData.banned.map((b) => b.trim()).filter((b) => b.length > 0);
  const note = formData.note?.trim() || null;

  if (!preferred || banned.length === 0) {
    return { error: 'Preferred term and at least one banned variation are required.' };
  }

  let entryId = formData.id;

  if (entryId) {
    const { error } = await supabase
      .from('glossary')
      .update({ preferred, banned, note })
      .eq('id', entryId)
      .eq('org_id', profile.org_id);

    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from('glossary')
      .insert({
        org_id: profile.org_id,
        preferred,
        banned,
        note,
      })
      .select('id')
      .single();

    if (error || !data) return { error: error?.message || 'Failed to save glossary entry.' };
    entryId = data.id;
  }

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    formData.id ? 'glossary_updated' : 'glossary_created',
    { type: 'glossary', id: entryId! },
    { preferred, banned_count: banned.length }
  );

  revalidatePath('/admin/glossary');
  revalidatePath('/rules');
  return { success: true, entryId };
}

export async function deleteGlossaryEntry(id: string) {
  const { user, profile } = await getAdminUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('glossary')
    .delete()
    .eq('id', id)
    .eq('org_id', profile.org_id);

  if (error) return { error: error.message };

  await writeAudit(
    { id: user.id, type: 'user', org_id: profile.org_id },
    'glossary_deleted',
    { type: 'glossary', id },
    {}
  );

  revalidatePath('/admin/glossary');
  revalidatePath('/rules');
  return { success: true };
}
