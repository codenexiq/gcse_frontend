import SignupSettings from "@/components/adm/admin/settings/signup/SignupSettings";
import { serverFetch } from "@/lib/serverApi";

/** Admin > Settings > Sign-up. */
export default async function SignupPage() {
  const { welcome } = await serverFetch<{ welcome: string }>("/admin/settings/signup");
  return <SignupSettings initialWelcome={welcome} />;
}
