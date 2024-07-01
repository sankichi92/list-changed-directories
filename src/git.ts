import path from "path";

import * as exec from "@actions/exec";

export async function gitLsDirs(paths: string[]) {
  // https://git-scm.com/docs/gitglossary/#Documentation/gitglossary.txt-glob
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

export async function gitFetch(sha: string) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha]);
}

export async function gitDiffExists(commit: string, path: string) {
  const exitCode = await exec.exec(
    "git",
    ["diff", "--exit-code", "--quiet", commit, "--", path],
    { ignoreReturnCode: true },
  );
  return exitCode !== 0;
}
