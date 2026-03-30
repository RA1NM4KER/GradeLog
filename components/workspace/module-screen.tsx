"use client";

import { Calculator } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { AssessmentTable } from "@/components/workspace/assessment-table";
import { ExperimentModePill } from "@/components/workspace/experiment-mode-pill";
import { GradeBandPanel } from "@/components/workspace/grade-band-panel";
import { ModuleHeader } from "@/components/workspace/module-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { navigateWorkspace } from "@/lib/workspace-navigation";
import { Assessment } from "@/lib/types";

export function ModuleScreen({ moduleId }: { moduleId?: string }) {
  const {
    semester,
    addAssessment,
    isExperimenting,
    reorderAssessments,
    startExperiment,
    stopExperiment,
    updateAssessment,
    updateModule,
  } = useWorkspace();
  const module = semester.modules.find((item) => item.id === moduleId) ?? null;

  function toggleExperiment() {
    if (isExperimenting) {
      stopExperiment();
      return;
    }

    startExperiment();
  }

  function saveAssessment(nextModuleId: string, assessment: Assessment) {
    const exists = module?.assessments.some(
      (item) => item.id === assessment.id,
    );

    if (exists) {
      updateAssessment(nextModuleId, assessment);
      return;
    }

    addAssessment(nextModuleId, assessment);
  }

  function updateGradeBand(bandId: string, threshold: number) {
    if (!module) {
      return;
    }

    updateModule(module.id, {
      gradeBands: module.gradeBands.map((band) =>
        band.id === bandId
          ? { ...band, threshold: Math.min(Math.max(threshold || 0, 0), 100) }
          : band,
      ),
    });
  }

  if (!module) {
    return (
      <div className="mx-auto max-w-5xl px-5 pb-10 pt-6 sm:px-8">
        <EmptyState
          action={
            <button
              className="inline-flex h-11 items-center rounded-full bg-stone-950 px-5 text-sm font-semibold text-stone-50"
              onClick={() => navigateWorkspace("/workspace")}
              type="button"
            >
              Back to semester
            </button>
          }
          description="The selected module could not be found."
          icon={<Calculator className="h-5 w-5" />}
          title="Module unavailable"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-5.5rem)] max-w-7xl px-4 pb-8 pt-4 sm:px-8 sm:py-4">
      <div className="mb-4">
        <ModuleHeader
          module={module}
          onSaveModule={(nextModule) =>
            updateModule(module.id, {
              accent: nextModule.accent,
              code: nextModule.code,
              credits: nextModule.credits,
              gradeBands: module.gradeBands,
              instructor: nextModule.instructor,
              name: nextModule.name,
            })
          }
        />
      </div>

      {isExperimenting ? (
        <ExperimentModePill onStopAction={stopExperiment} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(320px,26rem)] md:items-start lg:grid-cols-[minmax(0,1fr)_560px]">
        <div className="order-2 mt-2 grid min-h-0 md:order-1 md:mt-7">
          <AssessmentTable
            module={module}
            isExperimenting={isExperimenting}
            onToggleExperiment={toggleExperiment}
            onReorderAssessments={reorderAssessments}
            onSaveAssessment={saveAssessment}
          />
        </div>

        <div className="order-1 grid min-h-0 content-start gap-4 md:order-2 md:overflow-y-auto md:pr-1">
          <GradeBandPanel module={module} onUpdateGradeBand={updateGradeBand} />
        </div>
      </div>
    </div>
  );
}
