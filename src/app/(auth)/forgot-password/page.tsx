import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";
import { AuthPageHeader } from "@/components/shared/auth-page-header";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your GIREAPP password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8 lg:min-h-[calc(100vh-200px)] justify-center">
      <AuthPageHeader
        title="Forgot password?"
        subtitle="Enter your email and we'll send you a reset link"
        backHref="/login"
        backLabel="Go back to log in"
      />
      <ForgotPasswordForm />
    </div>
  );
}
