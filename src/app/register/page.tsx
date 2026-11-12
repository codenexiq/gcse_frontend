import { redirect } from "next/navigation";
import SignupWizard from "@/components/adm/student/signup/SignupWizard";
import { homePathFor } from "@/lib/roles";
import { serverFetch } from "@/lib/serverApi";
import { getCurrentUser } from "@/lib/session";
import type { SignupOptions } from "@/types/student";

export const metadata = { title: "Create your account" };

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role)); // already signed in
  const options = await serverFetch<SignupOptions>("/auth/signup-options");
  return <SignupWizard options={options} />;
}
