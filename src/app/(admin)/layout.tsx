import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminSidebar } from "@/features/admin/admin-sidebar";
import { getStaffIdentity } from "@/features/admin/staff-identity";

const STAFF_ROLES = ["ADMIN", "TUTOR"];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Middleware already turns learners away; this is the second gate, for the
  // case where the shell is rendered outside a matched request.
  if (!session) redirect("/login");
  if (!STAFF_ROLES.includes(session.role)) redirect("/dashboard");

  const staff = await getStaffIdentity();

  return (
    <div className="min-h-screen bg-indigo-50">
      <AdminSidebar staff={staff} />

      {/* Figma places content at x=265 against the 240px rail. There is no
          admin bottom bar in the designs, so below md the rail is simply gone
          and the content runs full width. */}
      <main id="main-content" className="min-h-screen md:pl-[265px]">
        <div className="px-4 py-6 md:px-6 md:pr-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
