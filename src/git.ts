import path from "path";

import * as exec from "@actions/exec";

export async function gitFetch(sha: string) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha]);
}

export function gitDiffDirs(
  beforeSHA: string,
  afterSHA: string,
  paths: string[],
) {
  return gitDirs(["diff", "--name-only", `${beforeSHA}..${afterSHA}`], paths);
}

export function gitLsDirs(paths: string[]) {
  return gitDirs(["ls-files"], paths);
}

async function gitDirs(gitSubcommand: string[], paths: string[]) {
  // https://git-scm.com/docs/gitglossary/#Documentation/gitglossary.txt-glob
  const globEnabledPaths = paths.map((path) =>
    path.includes("**") ? `:(glob)${path}` : path,
  );

  let stdout = "";
  await exec.exec("git", [...gitSubcommand, "-z", "--", ...globEnabledPaths], {
    listeners: {
      stdout: (data) => (stdout += data.toString()),
    },
  });
  console.log(); // Add a newline since git ls-files -z doesn't end with a newline

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}
