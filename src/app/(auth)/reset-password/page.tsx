import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { AuthPageHeader } from "@/components/shared/auth-page-header";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your GIREAPP account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8 lg:min-h-[calc(100vh-200px)] justify-center">
      <AuthPageHeader
        title="Create new password"
        subtitle="Your new password must be different from previously used passwords"
        backHref="/login"
        backLabel="Go back to log in"
      />
      <Suspense
        fallback={
          <div className="h-[300px] w-full animate-pulse bg-indigo-100 rounded-lg" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
