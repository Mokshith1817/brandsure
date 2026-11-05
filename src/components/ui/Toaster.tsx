'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'bg-white border-slate-200 text-slate-900 shadow-md',
          description: 'text-slate-500',
          actionButton: 'bg-indigo-600 text-white',
          cancelButton: 'bg-slate-100 text-slate-600',
        },
      }}
    />
  );
}
