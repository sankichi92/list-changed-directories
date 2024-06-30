import * as core from "@actions/core";
import * as github from "@actions/github";

import { gitDiffExists, gitFetch, gitLsDirs } from "./git";
import { getBeforeAndAfterSHA } from "./github";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    const isDebug = core.isDebug();
    const targetFile = core.getInput("target-file", { required: true });
    const targetDirs = core.getMultilineInput("target-directories");

    const candidateDirs = await gitLsDirs(targetDirs, targetFile, !isDebug);
    console.log(`Candidate directories: ${candidateDirs}`);

    const [beforeSHA, afterSHA] = getBeforeAndAfterSHA(github.context);
    for (const sha of [beforeSHA, afterSHA]) {
      await gitFetch(sha, !isDebug);
    }
    console.log(`Comparing: ${beforeSHA}..${afterSHA}`);

    const isChanged = await Promise.all(
      candidateDirs.map((dir) =>
        gitDiffExists(beforeSHA, afterSHA, dir, !isDebug),
      ),
    );
    const changedDirs = candidateDirs.filter((_, i) => isChanged[i]);
    console.log(`Changed directories: ${changedDirs}`);

    core.setOutput("changed-directories", changedDirs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
