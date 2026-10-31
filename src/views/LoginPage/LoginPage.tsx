import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import AuthNotice from "@/components/auth/AuthNotice";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role)); // already logged in

  return (
    <AuthCard
      icon={<LogIn />}
      title="Sign in to GCSE Cloud"
      subtitle="Welcome back! Sign in to see your subjects, topics and revision items."
      footer="By signing in, you agree to keep your account details private."
    >
      <AuthForm mode="login" />
    </AuthCard>
  );
}
