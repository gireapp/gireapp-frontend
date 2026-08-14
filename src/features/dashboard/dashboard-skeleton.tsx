"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * FE-DASH-010. Every block mirrors the real card's height so swapping skeleton
 * for content shifts nothing — that is what keeps CLS down, not the animation.
 */
const SLOW_LOAD_TIMEOUT_MS = 8000;

const BLOCK = "animate-pulse-skeleton rounded-lg bg-indigo-100";

export function DashboardSkeleton() {
  const router = useRouter();
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (isSlow) {
    return (
      <div
        className="mx-auto flex w-full max-w-[1143px] flex-col items-center gap-4 py-24 text-center"
        role="alert"
      >
        <p className="font-heading text-[20px] font-bold text-indigo-950">
          Failed to load
        </p>
        <p className="max-w-[320px] font-sans text-[14px] text-indigo-400">
          Your dashboard is taking longer than usual. Check your connection and
          try again.
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-indigo-800 px-6 font-sans text-[14px] text-indigo-50 transition-colors hover:bg-indigo-900"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex w-full max-w-[1143px] flex-col gap-8"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      {/* Topbar: 472px search, then the avatar cluster. */}
      <div className="flex items-center justify-between gap-4 md:gap-8">
        <div className={`${BLOCK} h-9 w-full max-w-[472px]`} />
        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <div className={`${BLOCK} h-10 w-10 rounded-full`} />
          <div className={`${BLOCK} h-10 w-10 rounded-full`} />
          <div className={`${BLOCK} hidden h-10 w-[120px] md:block`} />
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:gap-6">
        <div className="contents xl:flex xl:min-w-0 xl:flex-1 xl:flex-col xl:gap-8">
          <div
            className={`${BLOCK} order-2 min-h-[188px] md:min-h-[288px] xl:order-none`}
          />

          <section className="order-3 flex flex-col gap-4 xl:order-none xl:gap-8">
            <div className={`${BLOCK} h-[25px] w-[135px]`} />
            <div className={`${BLOCK} min-h-[280px] md:min-h-[288px]`} />
          </section>

          <div
            className={`${BLOCK} order-7 min-h-[185px] md:min-h-[156px] xl:order-none`}
          />
        </div>

        <div className="contents xl:flex xl:w-[443px] xl:shrink-0 xl:flex-col xl:gap-8">
          <div
            className={`${BLOCK} order-4 min-h-[184px] md:min-h-[288px] xl:order-none`}
          />

          <section className="order-5 flex flex-col gap-4 xl:order-none xl:gap-6">
            <div className={`${BLOCK} h-[25px] w-[241px]`} />
            <div className={`${BLOCK} min-h-[200px] md:min-h-[392px]`} />
          </section>
        </div>
      </div>
    </div>
  );
}
