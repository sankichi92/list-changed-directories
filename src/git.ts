import path from "path";

import * as exec from "@actions/exec";

export async function gitLsDirs(
  targetDirs: string[],
  targetFile: string,
  silent: boolean = true,
) {
  const targetPatterns = targetDirs.map((dir) => {
    // https://git-scm.com/docs/gitglossary/#Documentation/gitglossary.txt-glob
    const globEnabledDir = dir.includes("**") ? `:(glob)${dir}` : dir;
    return path.join(globEnabledDir, targetFile);
  });

  let stdout = "";
  await exec.exec("git", ["ls-files", "-z", "--", ...targetPatterns], {
    silent,
    listeners: {
      stdout: (data) => (stdout += data.toString()),
    },
  });

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}

export async function gitFetch(sha: string, silent: boolean = true) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha], { silent });
}

export async function gitDiffExists(
  beforeSHA: string,
  afterSHA: string,
  dir: string,
  silent: boolean = true,
) {
  const result = await exec.exec(
    "git",
    ["diff", "--exit-code", "--quiet", `${beforeSHA}..${afterSHA}`, "--", dir],
    { silent, ignoreReturnCode: true },
  );
  return result !== 0;
}
