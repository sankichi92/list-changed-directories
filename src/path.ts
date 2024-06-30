import * as glob from "@actions/glob";
import path from "path";

export async function getCandidateDirectories(
  targetDirectories: string[],
  targetFile: string,
) {
  const patterns = targetDirectories.map((dir) => path.join(dir, targetFile));
  const globber = await glob.create(patterns.join("\n"));
  const paths = await globber.glob();
  const dirs = paths.map((file) => {
    const relativePath = path.relative(process.cwd(), path.dirname(file));
    return relativePath === "" ? "." : relativePath;
  });
  return [...new Set(dirs)];
}
