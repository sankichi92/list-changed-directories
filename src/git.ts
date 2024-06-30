import path from "path";

import * as exec from "@actions/exec";

export async function gitFetch(sha: string, silent: boolean = true) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha], { silent });
}

export async function gitDiffDirs(
  beforeSHA: string,
  afterSHA: string,
  paths: string[],
  silent: boolean = true,
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
      silent,
      listeners: {
        stdout: (data) => (stdout += data.toString()),
      },
    },
  );

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}

export async function gitLsDirs(paths: string[], silent: boolean = true) {
  const globEnabledPaths = paths.map((path) =>
    path.includes("**") ? `:(glob)${path}` : path,
  );

  let stdout = "";
  await exec.exec("git", ["ls-files", "-z", "--", ...globEnabledPaths], {
    silent,
    listeners: {
      stdout: (data) => (stdout += data.toString()),
    },
  });

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}
