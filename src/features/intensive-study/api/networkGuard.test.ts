// This file guards the test suite's network isolation: it asserts that
// API_URL resolves to a dead loopback address under test, so that any
// request which escapes its mock cannot physically leave the machine.
// Slice 2 will extend this guard to make an escaped request fail loudly.
import { describe, expect, it } from "vitest";
import { API_URL } from "../../../config";

describe("network guard", () => {
  it("API_URL resolves to the dead loopback address under test", () => {
    expect(API_URL).toBe("http://127.0.0.1:1/api");
  });
});
