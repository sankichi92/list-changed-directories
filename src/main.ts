import * as core from "@actions/core";

export async function run() {
  try {
    const directories = core.getMultilineInput("directories");
    core.setOutput("directories", directories);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
