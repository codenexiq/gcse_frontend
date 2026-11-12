import LoginPage from "@/views/LoginPage";

// The same sign-in page with the Teacher tab open. Kept out of search engines.
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function Page() {
  return <LoginPage initial="teacher" />;
}
