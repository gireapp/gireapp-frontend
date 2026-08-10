import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";
import { AuthPageHeader } from "@/components/shared/auth-page-header";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your GIREAPP account to continue learning.",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-[490px] mx-auto flex flex-col gap-8 lg:min-h-[calc(100vh-200px)] justify-center">
      <AuthPageHeader
        title="Welcome back"
        subtitle="Log in to continue your learning journey"
        backHref="/"
        backLabel="Go back to landing page"
      />
      <LoginForm />
    </div>
  );
}
