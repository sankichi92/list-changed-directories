import path from "path";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { gitDiffDirs, gitFetch } from "./git";
import { getBaseRef } from "./github";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    core.startGroup("Fetching the base commit");
    const baseRef = getBaseRef(github.context);
    await gitFetch(baseRef);
    core.endGroup();

    const targetFile = core.getInput("target-file", { required: true });
    const targetDirs = core.getMultilineInput("target-directories");
    const targetPaths = targetDirs.map((dir) => path.join(dir, targetFile));

    core.startGroup("Comparing git diff");
    const changedDirs = await gitDiffDirs(baseRef, targetPaths);
    core.endGroup();

    core.info(`Changed directories: ${changedDirs}`);
    core.setOutput("changed-directories", changedDirs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
