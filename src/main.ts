import * as core from "@actions/core";
import * as github from "@actions/github";

import path from "path";
import { gitDiffDirs, gitFetch } from "./git";
import { getBeforeAndAfterSHA } from "./github";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    const isDebug = core.isDebug();

    const [beforeSHA, afterSHA] = getBeforeAndAfterSHA(github.context);
    for (const sha of [beforeSHA, afterSHA]) {
      await gitFetch(sha, !isDebug);
    }
    console.log(`Comparing: ${beforeSHA}..${afterSHA}`);

    const targetFile = core.getInput("target-file", { required: true });
    const targetDirs = core.getMultilineInput("target-directories");

    const changedDirs = await gitDiffDirs(
      beforeSHA,
      afterSHA,
      targetDirs.map((dir) => path.join(dir, targetFile)),
      !isDebug,
    );
    console.log(`Changed directories: ${changedDirs}`);

    core.setOutput("changed-directories", changedDirs);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
