import path from "path";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { gitDiffExists, gitFetch, gitLsFiles } from "./git";
import { getBaseSHA } from "./github";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    const targetFile = core.getInput("target-file", { required: true });

    core.startGroup("Listing candidate directories");
    // https://git-scm.com/docs/gitglossary/#Documentation/gitglossary.txt-glob
    const targetFiles = await gitLsFiles(`:(glob)**/${targetFile}`);
    const candidateDirs = [...new Set(targetFiles.map((f) => path.dirname(f)))];
    core.info(`Candidate directories: ${JSON.stringify(candidateDirs)}`);
    core.endGroup();

    core.startGroup("Fetching the base commit");
    const baseSHA = getBaseSHA(github.context);
    await gitFetch(baseSHA);
    core.endGroup();

    core.startGroup("Comparing git diff");
    const isChanged = await Promise.all(
      candidateDirs.map((dir) => gitDiffExists(baseSHA, dir)),
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
