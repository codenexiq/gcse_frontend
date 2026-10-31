import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import AuthForm from "@/components/auth/AuthForm";
import AuthNotice from "@/components/auth/AuthNotice";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";

export default async function TutorLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role)); // already signed in

  return (
    <AuthCard
      icon={<ShieldCheck />}
      title="Tutor sign in"
      subtitle="For tutors and administrators. Use the account an administrator created for you."
      footer="Tutor accounts are created by an administrator - there is no public sign-up."
    >
      <AuthForm mode="tutor" />
    </AuthCard>
  );
}
