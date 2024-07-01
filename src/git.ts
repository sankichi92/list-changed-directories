import * as exec from "@actions/exec";

export async function gitLsFiles(path: string) {
  let stdout = "";
  await exec.exec("git", ["ls-files", "-z", "--", path], {
    listeners: {
      stdout: (data) => (stdout += data.toString()),
    },
  });
  console.log(); // Add a newline since git ls-files -z doesn't end with a newline
  return stdout.split("\0").filter((file) => file.length > 0);
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
