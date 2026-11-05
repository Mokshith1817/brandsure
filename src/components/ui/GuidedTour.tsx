'use client';

import React, { useEffect, useState } from 'react';
import { HelpCircle, X, ChevronRight, ChevronLeft, Check, Sparkles, ShieldCheck, Eye } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '1. Welcome to Your Review Workspace',
    description:
      'This screen checks your draft against only approved PayNest guidelines and verified facts. The AI reads, flags, and suggests — humans make all final decisions.',
    icon: <ShieldCheck className="w-6 h-6 text-indigo-600" aria-hidden="true" />,
  },
  {
    title: '2. Interactive Highlighted Phrases',
    description:
      'Any potential problem is highlighted in color in your text. Click any highlighted phrase on the left to immediately inspect its citation and reason on the right.',
    icon: <Eye className="w-6 h-6 text-amber-600" aria-hidden="true" />,
  },
  {
    title: '3. Accept, Customize, or Dismiss',
    description:
      'For every finding, you can click "Accept Fix" to apply the safer wording instantly, "Edit" to customize it, or "Dismiss" if you have an approved legal waiver.',
    icon: <Sparkles className="w-6 h-6 text-emerald-600" aria-hidden="true" />,
  },
  {
    title: '4. Submit for Team Sign-Off',
    description:
      'Once all high-severity items are resolved, click "Submit for Review". Your compliance manager will review your changes and provide official approval.',
    icon: <Check className="w-6 h-6 text-blue-600" aria-hidden="true" />,
  },
];

interface GuidedTourProps {
  tourKey?: string;
  forceOpen?: boolean;
  onClose?: () => void;
}

export function GuidedTour({
  tourKey = 'brandsure_tour_review_v1',
  forceOpen = false,
  onClose,
}: GuidedTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    const dismissed = localStorage.getItem(tourKey);
    if (!dismissed) {
      setIsOpen(true);
    }
  }, [forceOpen, tourKey]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(tourKey, 'true');
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="First-time review tour"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-6 relative animate-fade-in-up">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Close tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Content */}
        <div className="space-y-4 pt-2">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
            {step.icon}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{step.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Progress Dots and Action Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-indigo-600 w-5' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Skip tour
            </button>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-xs transition-colors tap-target-44 focus:outline-none focus:ring-2 focus:ring-indigo-500 inline-flex items-center gap-1"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Got it!' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
