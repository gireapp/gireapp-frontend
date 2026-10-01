import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/roles";
import { AdminSidebar } from "@/features/admin/admin-sidebar";
import { AdminMobileNav } from "@/features/admin/admin-mobile-nav";
import { getStaffIdentity } from "@/features/admin/staff-identity";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Middleware already turns learners away; this is the second gate, for the
  // case where the shell is rendered outside a matched request.
  if (!session) redirect("/login");
  if (!isStaffRole(session.role)) redirect("/dashboard");

  const staff = await getStaffIdentity();

  return (
    <div className="min-h-screen bg-indigo-50">
      <AdminSidebar staff={staff} />
      <AdminMobileNav staff={staff} />

      {/* Figma places content at x=265 against the 240px rail; below md the
          rail becomes the top bar and content runs full width.
          `min-w-0` + `overflow-x-clip`: wide content (charts, tables) must
          scroll inside its own container. Without this guard a single wide
          child widens the whole page and every section scrolls sideways. */}
      <main
        id="main-content"
        className="min-h-screen min-w-0 overflow-x-clip md:pl-[265px]"
      >
        <div className="px-4 py-6 md:px-6 md:pr-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
