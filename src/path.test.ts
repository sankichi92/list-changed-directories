import { describe, expect, test } from "vitest";
import { getCandidateDirectories } from "./path";

describe("getCandidateDirectories", () => {
  test("returns expanded directories from the given args", async () => {
    // Given
    const targetDirectories = ["src", "dist"];
    const targetFile = "*.ts";

    // When
    const directories = await getCandidateDirectories(
      targetDirectories,
      targetFile,
    );

    // Then
    expect(directories).toStrictEqual(["src"]);
  });

  test("returns the current directory as `.`", async () => {
    // Given
    const targetDirectories = [""];
    const targetFile = "*.md";

    // When
    const directories = await getCandidateDirectories(
      targetDirectories,
      targetFile,
    );

    // Then
    expect(directories).toStrictEqual(["."]);
  });
});
