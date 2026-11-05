import React from 'react';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { getCurrentSession } from '@/lib/auth';
import { NewDraftClient } from './NewDraftClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New Draft | BrandSure',
  description: 'Create and submit new marketing content for pre-publication brand check.',
};

export default async function NewDraftPage() {
  const { user, profile } = await getCurrentSession();

  if (!user || !profile) {
    redirect('/login');
  }

  return (
    <AppLayout
      userEmail={user.email}
      fullName={profile.full_name}
      role={profile.role}
      orgName={profile.organisations?.name || 'PayNest'}
    >
      <div className="space-y-6 max-w-4xl">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Submit Marketing Content
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Input draft copy across social, advertising, email, or blog channels to trigger bounded governance checks.
          </p>
        </div>

        <NewDraftClient userRole={profile.role} />
      </div>
    </AppLayout>
  );
}
