import path from "path";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { gitDiffExists, gitFetch, gitLsDirs } from "./git";
import { getBaseRef } from "./github";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    const targetFile = core.getInput("target-file", { required: true });
    const targetDirs = core.getMultilineInput("target-directories");
    const targetPaths = targetDirs.map((dir) => path.join(dir, targetFile));

    core.startGroup("List candidate directories");
    const candidateDirs = await gitLsDirs(targetPaths);
    core.info(`Candidate directories: ${JSON.stringify(candidateDirs)}`);
    core.endGroup();

    core.startGroup("Fetching the base commit");
    const baseRef = getBaseRef(github.context);
    await gitFetch(baseRef);
    core.endGroup();

    core.startGroup("Comparing git diff");
    const isChanged = await Promise.all(
      candidateDirs.map((dir) => gitDiffExists(baseRef, dir)),
    );
    const changedDirs = candidateDirs.filter((_, i) => isChanged[i]);
    core.endGroup();

    if (changedDirs.length === 0) {
      core.info("No directories have changed.");
    } else {
      core.info(`Changed directories: ${JSON.stringify(changedDirs)}`);
    }

    core.setOutput("changed-directories", changedDirs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
