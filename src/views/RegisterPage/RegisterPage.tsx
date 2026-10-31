import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import AuthNotice from "@/components/auth/AuthNotice";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role)); // already logged in

  return (
    <AuthCard
      icon={<UserPlus />}
      title="Create your account"
      subtitle="Join GCSE Cloud to organise your revision by subject and topic."
      footer="Your items are private and only visible to you."
    >
      <AuthForm mode="register" />
    </AuthCard>
  );
}
