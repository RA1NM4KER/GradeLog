import { ModuleScreen } from "@/components/workspace/module-screen";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <ModuleScreen courseId={courseId} />;
}
