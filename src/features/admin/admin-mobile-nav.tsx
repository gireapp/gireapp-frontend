"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { GireappLogo } from "@/components/shared/gireapp-logo";
import { AdminNavBody } from "@/features/admin/admin-sidebar";
import { ADMIN_HOME_HREF } from "@/features/admin/admin-nav-items";
import type { StaffIdentity } from "@/features/admin/staff-identity";

/**
 * Below `md` the rail is gone. The admin nav has seven destinations plus
 * Logout — too many for the learner shell's five-slot bottom bar — so it lives
 * in a drawer behind a menu button instead. Radix Dialog supplies the focus
 * trap, Escape to close and background scroll lock.
 */
export function AdminMobileNav({ staff }: { staff: StaffIdentity }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-indigo-800 px-4 md:hidden">
      <GireappLogo
        surface="onDark"
        height={28}
        href={ADMIN_HOME_HREF}
        priority
      />

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-indigo-50 transition-colors hover:bg-indigo-400/20"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-indigo-950/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[320px] flex-col bg-indigo-800 px-6 pb-6 pt-4 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
            <div className="flex h-10 items-center justify-between">
              <GireappLogo
                surface="onDark"
                height={28}
                href={ADMIN_HOME_HREF}
              />
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-indigo-50 transition-colors hover:bg-indigo-400/20"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
            <Dialog.Description className="sr-only">
              Navigate between admin sections or log out.
            </Dialog.Description>

            <div className="scrollbar-slim mt-8 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              <AdminNavBody staff={staff} variant="drawer" onNavigate={close} />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
