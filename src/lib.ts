import * as glob from "@actions/glob";
import path from "path";

export async function expandCandidateDirectories(
  targetDirectories: string[],
  targetFile: string,
) {
  const patterns = targetDirectories.map((dir) => path.join(dir, targetFile));
  const globber = await glob.create(patterns.join("\n"));
  const files = await globber.glob();
  const directories = [...new Set(files.map((file) => path.dirname(file)))];
  return directories;
}
