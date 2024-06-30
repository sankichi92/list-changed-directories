import * as exec from "@actions/exec";
import path from "path";

export async function gitLsDirs(paths: string[]) {
  let stdout = "";
  await exec.exec("git", ["ls-files", "-z", "--", ...paths], {
    silent: true,
    listeners: {
      stdout: (data) => {
        stdout += data.toString();
      },
    },
  });

  const files = stdout.split("\0").filter((file) => file.length > 0);
  const dirs = files.map((file) => path.dirname(file));
  return [...new Set(dirs)];
}

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