import { describe, expect, test } from "vitest";
import { gitLsDirs } from "./git";

describe("gitLsDirs", () => {
  test("returns expanded directories from the given patterns", async () => {
    // Given
    const targetDirs = ["**"];
    const targetFile = "*.ts";

    // When
    const directories = await gitLsDirs(targetDirs, targetFile);

    // Then
    expect(directories).toStrictEqual(["src"]);
  });
});
