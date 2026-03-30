import { ArrowLeft, Cog } from "lucide-react";

import { ModuleDialog } from "@/components/dashboard/module-dialog";
import { Button } from "@/components/ui/button";
import { navigateWorkspace } from "@/lib/workspace-navigation";
import { Module } from "@/lib/types";

export function ModuleHeader({
  module,
  onSaveModule,
}: {
  module: Module;
  onSaveModule: (module: Module) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <button
          className="inline-flex items-center gap-2 text-xs text-stone-500 transition hover:text-stone-950 sm:text-sm"
          onClick={() => navigateWorkspace("/workspace")}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Semester
        </button>
        <div className="mt-1.5 flex items-start gap-1.5 sm:mt-2 sm:gap-2">
          <h1 className="min-w-0 text-[1.85rem] font-semibold leading-none tracking-tight text-stone-950 sm:text-3xl">
            {module.name}
          </h1>
          <ModuleDialog
            module={module}
            onSaveModule={onSaveModule}
            triggerAsChild
            triggerChildren={
              <Button
                aria-label="Edit module"
                className="group mt-0.5 h-auto w-auto shrink-0 rounded-none border-0 bg-transparent p-0 text-stone-500 shadow-none hover:bg-transparent hover:text-stone-800"
                size="icon"
                title="Edit module"
                type="button"
                variant="ghost"
              >
                <Cog className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90 sm:h-7 sm:w-7" />
              </Button>
            }
          />
        </div>
        <p className="mt-1 text-sm leading-snug text-stone-600">
          <span>{module.code}</span>
          <span className="mx-1.5 text-stone-400">·</span>
          <span>{module.instructor}</span>
          <span className="mx-1.5 text-stone-400">·</span>
          <span>{module.credits} credits</span>
        </p>
      </div>
    </div>
  );
}
