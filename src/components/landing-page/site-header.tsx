import Image from "next/image";
import Link from "next/link";
import { SafeLink } from "@/components/shared/safe-link";

/** The indigo bar with Login and Sign up, shared by every public page. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-indigo-800 border-b border-border/40">
      <nav className="flex items-center justify-between px-4 py-6 mx-auto max-w-7xl md:px-6">
        <Link href="/" aria-label="GIREAPP home">
          <Image
            src="/logo-white.svg"
            alt="GIREAPP Logo"
            width={136}
            height={32}
            className="w-[106px] h-[28px] md:w-[136px] md:h-[32px]"
          />
        </Link>

        <div className="flex items-center gap-4 font-inter">
          <Link
            href="/login"
            className="text-base font-normal transition-colors text-indigo-50 hover:text-white"
          >
            Login
          </Link>
          <SafeLink
            href="/register"
            id="nav-signup-cta"
            className="flex gap-1 items-center justify-center bg-orange-500 text-white rounded-lg font-normal text-base py-1 px-2.5"
          >
            Sign up
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.5 12H5"
                stroke="#EEF2FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6"
                stroke="#EEF2FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </SafeLink>
        </div>
      </nav>
    </header>
  );
}
