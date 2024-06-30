import { describe, expect, test } from "vitest";
import { gitLsDirs } from "./git";

describe("gitLsDirs", () => {
  test("returns expanded directories from the given patterns", async () => {
    // Given
    const paths = ["**/*.ts"];

    // When
    const directories = await gitLsDirs(paths);

    // Then
    expect(directories).toStrictEqual(["src"]);
  });

  test("returns expanded directories from the given patterns 2", async () => {
    // Given
    const paths = ["*s"];

    // When
    const directories = await gitLsDirs(paths);

    // Then
    expect(directories).toStrictEqual([".", "dist", "src"]);
  });
});
