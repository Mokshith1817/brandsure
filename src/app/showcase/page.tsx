'use client';

import React, { useEffect } from 'react';
import { scrollManager } from '@/components/showcase/scroll';
import { Chrome } from '@/components/showcase/Chrome';
import { Hero } from '@/components/showcase/Hero';
import { GovernancePipeline } from '@/components/showcase/GovernancePipeline';
import { CampaignLog } from '@/components/showcase/CampaignLog';
import { Tiers } from '@/components/showcase/Tiers';
import { Manifest } from '@/components/showcase/Manifest';
import { Footer } from '@/components/showcase/Footer';

export default function ShowcasePage() {
  useEffect(() => {
    scrollManager.init();
    return () => scrollManager.destroy();
  }, []);

  return (
    <>
      {/* Import Michroma, Manrope & IBM Plex Mono */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600;700&family=Michroma&display=swap"
        rel="stylesheet"
      />

      <main className="relative min-h-screen bg-void text-regolith selection:bg-earth selection:text-void overflow-x-hidden font-sans">
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
