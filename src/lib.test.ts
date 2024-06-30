import path from "path";
import { describe, expect, test } from "vitest";
import { expandCandidateDirectories } from "./lib";

describe("expandCandidateDirectories", () => {
  test("returns expanded directories", async () => {
    // Given
    const targetDirectories = ["src", "dist"];
    const targetFile = "*.ts";

    // When
    const directories = await expandCandidateDirectories(
      targetDirectories,
      targetFile,
    );

    // Then
    expect(
      directories.map((dir) => path.relative(process.cwd(), dir)),
    ).toStrictEqual(["src"]);
  });
});
