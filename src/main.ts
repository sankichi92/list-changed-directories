import * as core from "@actions/core";
import * as github from "@actions/github";

import { gitDiffExists, gitFetch } from "./git";
import { getBeforeAndAfterSHA } from "./github";
import { getCandidateDirectories } from "./path";

export async function run() {
  try {
    if (!["push", "pull_request"].includes(github.context.eventName)) {
      throw new Error(
        "This action is only available for `push` and `pull_request` events.",
      );
    }

    const targetDirectories = core.getMultilineInput("target-directories");
    const targetFile = core.getInput("target-file");

    const candidateDirectories = await getCandidateDirectories(
      targetDirectories,
      targetFile,
    );

    if (candidateDirectories.length === 0) {
      console.log("No candidate directories found.");
      core.setOutput("directories", []);
      return;
    }

    console.log("Candidate directories:");
    for (const dir of candidateDirectories) {
      console.log(`- ${dir}`);
    }

    const [beforeSHA, afterSHA] = getBeforeAndAfterSHA(github.context);
    for (const sha of [beforeSHA, afterSHA]) {
      await gitFetch(sha);
    }

    const changedDirectories = candidateDirectories.filter(async (dir) => {
      return await gitDiffExists(beforeSHA, afterSHA, dir);
    });

    core.setOutput("directories", changedDirectories);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
