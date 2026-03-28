import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import {
  AppState,
  getDefaultAppState,
  normalizeAppState,
} from "@/lib/app-state";

const stateDir = path.join(process.cwd(), ".gradeflow");
const stateFile = path.join(stateDir, "state.json");
const templateFile = path.join(stateDir, "state.template.json");

export async function readAppStateFile(): Promise<AppState> {
  try {
    const file = await readFile(stateFile, "utf8");
    return normalizeAppState(JSON.parse(file));
  } catch {
    try {
      const file = await readFile(templateFile, "utf8");
      return normalizeAppState(JSON.parse(file));
    } catch {
      return getDefaultAppState();
    }
  }
}

export async function writeAppStateFile(state: AppState) {
  await mkdir(stateDir, { recursive: true });
  await writeFile(stateFile, JSON.stringify(normalizeAppState(state), null, 2));
}
