import StudentDiagnosticPage from "@/views/student/diagnostic";

export const metadata = { title: "Diagnostic" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDiagnosticPage id={id} />;
}
