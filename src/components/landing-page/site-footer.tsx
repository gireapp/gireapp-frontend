import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-indigo-800">
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-6 mx-auto text-sm max-w-7xl md:flex-row md:px-6 text-indigo-200 font-inter">
        <p>©️ {new Date().getFullYear()} GIREAPP. All rights reserved.</p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/mentorship" className="hover:text-white">
            Mentorship
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
