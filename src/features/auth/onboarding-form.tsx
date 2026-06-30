'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, BookOpen, GraduationCap, Trophy, Sparkles } from 'lucide-react';
import { completeOnboardingAction } from '@/features/auth/actions';
import { DEPARTMENTS, MOOD_THEMES, type AcademicLevel } from '@gireapp/shared';
import type { ApiResponse } from '@gireapp/shared';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const initialState: ApiResponse = { success: false };

const LEVEL_OPTIONS: { value: AcademicLevel; label: string; icon: typeof BookOpen; description: string; color: string }[] = [
  { value: 'SECONDARY', label: 'Secondary', icon: BookOpen, description: 'High school (Science, Business, Arts)', color: 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700' },
  { value: 'TERTIARY', label: 'Tertiary', icon: GraduationCap, description: 'University (Undergraduate / Postgraduate)', color: 'border-coral-300 bg-coral-50 dark:bg-coral-900/20 dark:border-coral-700' },
  { value: 'PROFESSIONAL', label: 'Professional', icon: Trophy, description: 'Working adults / certifications', color: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700' },
];

const MOOD_OPTIONS: { value: string; label: string; emoji: string; bg: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '🧘', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { value: 'focused', label: 'Focused', emoji: '🎯', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { value: 'energized', label: 'Energized', emoji: '⚡', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'relaxed', label: 'Relaxed', emoji: '🌿', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
];

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<AcademicLevel | ''>('');
  const [department, setDepartment] = useState('');
  const [mood, setMood] = useState('calm');
  const router = useRouter();

  const departments = level ? DEPARTMENTS[level] : [];

  useEffect(() => {
    if (state.success) {
      toast.success('Profile set up! Welcome to your dashboard.');
      router.push('/dashboard');
      router.refresh();
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  // Reset department when level changes
  useEffect(() => {
    setDepartment('');
  }, [level]);

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              s === step ? 'w-10 bg-primary' : s < step ? 'w-6 bg-primary/60' : 'w-6 bg-muted'
            )}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Step 1: Academic Level */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-h3 text-foreground text-center">What&apos;s your academic level?</h2>
          <div className="grid gap-3">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { setLevel(opt.value); setStep(2); }}
                aria-pressed={level === opt.value}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md text-left',
                  level === opt.value ? opt.color : 'border-border bg-card hover:border-primary/30'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <opt.icon className="w-5 h-5 text-foreground" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Department */}
      {step === 2 && level && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-h3 text-foreground text-center">Choose your department</h2>
          <div className="grid gap-3">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => { setDepartment(dept); setStep(3); }}
                aria-pressed={department === dept}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all hover:shadow-md text-left font-medium',
                  department === dept ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                )}
              >
                {dept}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
            ← Back
          </button>
        </div>
      )}

      {/* Step 3: Mood */}
      {step === 3 && (
        <form action={formAction} className="space-y-4 animate-fade-in">
          <input type="hidden" name="academicLevel" value={level} />
          <input type="hidden" name="department" value={department} />
          <input type="hidden" name="moodTheme" value={mood} />

          <h2 className="text-h3 text-foreground text-center">How are you feeling today?</h2>
          <p className="text-sm text-muted-foreground text-center">This customises your dashboard vibe</p>

          <div className="grid grid-cols-2 gap-3">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMood(opt.value)}
                aria-pressed={mood === opt.value}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                  mood === opt.value ? `border-primary ${opt.bg}` : 'border-border bg-card hover:border-primary/30'
                )}
              >
                <span className="text-2xl" aria-hidden="true">{opt.emoji}</span>
                <span className="font-medium text-foreground">{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />Setting up...</>
            ) : (
              <><Sparkles className="w-4 h-4" aria-hidden="true" />Launch My Dashboard</>
            )}
          </button>

          <button type="button" onClick={() => setStep(2)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
