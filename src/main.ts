import * as core from "@actions/core";

import { expandCandidateDirectories } from "./lib";

export async function run() {
  try {
    const targetDirectories = core.getMultilineInput("target-directories");
    const targetFile = core.getInput("target-file");

    const candidateDirectories = await expandCandidateDirectories(
      targetDirectories,
      targetFile,
    );

    console.log("Candidate directories:");
    for (const dir of candidateDirectories) {
      console.log(`- ${dir}`);
    }

    core.setOutput("directories", candidateDirectories);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
