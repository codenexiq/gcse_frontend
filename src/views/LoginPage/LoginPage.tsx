import { redirect } from "next/navigation";
import LoginPanel, { type LoginRole } from "@/components/site/LoginPanel";
import { getCurrentUser } from "@/lib/session";
import { homePathFor } from "@/lib/roles";

/** The one sign-in page, set inside the public site (lavender band between the header and footer). `initial` is the tab that is open first. */
export default async function LoginPage({ initial = "student" }: { initial?: LoginRole }) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role)); // already logged in

  return (
    <section className="band lav" style={{ minHeight: "70vh" }}>
      <div className="in">
        <LoginPanel initial={initial} />
      </div>
    </section>
  );
}
