import { SemesterScreen } from "@/components/workspace/semester-screen";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const params = await searchParams;

  return <SemesterScreen semesterIdFromUrl={params.semester} />;
}
