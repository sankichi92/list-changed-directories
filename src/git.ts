import path from "path";

import * as exec from "@actions/exec";

export async function gitFetch(sha: string) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha]);
}

export async function gitDiffDirs(
  beforeSHA: string,
  afterSHA: string,
  paths: string[],
) {
  // https://git-scm.com/docs/gitglossary/#Documentation/gitglossary.txt-glob
  const globEnabledPaths = paths.map((path) =>
    path.includes("**") ? `:(glob)${path}` : path,
  );

  let stdout = "";
  await exec.exec(
    "git",
    [
      "diff",
      "--name-only",
      "-z",
      `${beforeSHA}..${afterSHA}`,
      "--",
      ...globEnabledPaths,
    ],
    {
      listeners: {
        stdout: (data) => (stdout += data.toString()),
      },
    },
  );
  console.log(); // Add a newline since git diff -z doesn't end with a newline

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}

export async function gitLsDirs(paths: string[]) {
  const globEnabledPaths = paths.map((path) =>
    path.includes("**") ? `:(glob)${path}` : path,
  );

  let stdout = "";
  await exec.exec("git", ["ls-files", "-z", "--", ...globEnabledPaths], {
    listeners: {
      stdout: (data) => (stdout += data.toString()),
    },
  });
  console.log(); // Add a newline since git ls-files -z doesn't end with a newline

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}
