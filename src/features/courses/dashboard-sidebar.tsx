'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, BookOpen, Trophy, MessageCircle, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn, getInitials, formatNumber } from '@/lib/utils';
import { logoutAction } from '@/features/auth/actions';
import type { SessionUser } from '@gireapp/shared';

const SEGMENT_MAP: Record<string, string> = {
  SECONDARY: '/dashboard/secondary',
  TERTIARY: '/dashboard/tertiary',
  PROFESSIONAL: '/dashboard/professional',
};

function getNavItems(academicLevel: string | null) {
  const dashboardHref = (academicLevel && SEGMENT_MAP[academicLevel]) || '/dashboard';
  return [
    { href: dashboardHref, label: 'Dashboard', icon: LayoutDashboard, matchSegment: true },
    { href: '/dashboard/courses', label: 'Courses', icon: BookOpen, matchSegment: false },
    { href: '/dashboard/achievements', label: 'Achievements', icon: Trophy, matchSegment: false },
    { href: '/dashboard/mentorship', label: 'Mentorship', icon: MessageCircle, matchSegment: false },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, matchSegment: false },
  ];
}

export function DashboardSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 border-r border-border bg-card z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-heading font-bold text-lg text-foreground">GIREAPP</span>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.department} • {formatNumber(user.points)} pts</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {getNavItems(user.academicLevel).map((item) => {
            const isActive = item.matchSegment
              ? pathname.startsWith(item.href)
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              Log Out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-bottom"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16">
          {getNavItems(user.academicLevel).slice(0, 4).map((item) => {
            const isActive = item.matchSegment
              ? pathname.startsWith(item.href)
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
