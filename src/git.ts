import * as exec from "@actions/exec";

export async function gitFetch(sha: string) {
  await exec.exec("git", ["fetch", "--depth=1", "origin", sha]);
}

export async function gitDiffExists(
  beforeSHA: string,
  afterSHA: string,
  dir: string,
) {
  const result = await exec.exec(
    "git",
    ["diff", "--exit-code", "--quiet", `${beforeSHA}..${afterSHA}`, "--", dir],
    {
      silent: true,
      ignoreReturnCode: true,
    },
  );
  return result !== 0;
}
