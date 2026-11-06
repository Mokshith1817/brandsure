'use client';

import React, { useEffect } from 'react';
import '@/components/showcase/showcase.css';
import { startScroll } from '@/components/showcase/scroll';
import { Chrome } from '@/components/showcase/Chrome';
import { Hero } from '@/components/showcase/Hero';
import { GovernancePipeline } from '@/components/showcase/GovernancePipeline';
import { CampaignLog } from '@/components/showcase/CampaignLog';
import { Tiers } from '@/components/showcase/Tiers';
import { Manifest } from '@/components/showcase/Manifest';
import { Footer } from '@/components/showcase/Footer';

export default function ShowcasePage() {
  useEffect(() => {
    // Check prefers-reduced-motion (R12)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReduced = mediaQuery.matches;

    // Isolate body styling for showcase (R8, R9)
    document.body.classList.add('showcase-body');

    // Mount Lenis scroll loop for this route only (R1, R9, R12)
    const cleanupScroll = startScroll(isReduced);

    return () => {
      document.body.classList.remove('showcase-body');
      cleanupScroll();
    };
  }, []);

  return (
    <>
      {/* Import Michroma, Manrope & IBM Plex Mono with display=swap (R15) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600;700&family=Michroma&display=swap"
        rel="stylesheet"
      />

      {/* Main container: window is the scroll container, overflow-x is clip (R8, R9) */}
      <main className="relative min-h-screen bg-void text-regolith selection:bg-earth selection:text-void font-sans">
        <Chrome />
        <Hero />
        <GovernancePipeline />
        <CampaignLog />
        <Tiers />
        <Manifest />
        <Footer />
      </main>
    </>
  );
}
