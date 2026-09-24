// This file guards the test suite's network isolation. It asserts that
// API_URL resolves to a dead loopback address under test (slice 1), and
// that any request which escapes its mock fails instantly with a clear
// error instead of hanging or reaching the network (slice 2).
import { afterEach, describe, expect, it } from "vitest";
import type { AxiosError } from "axios";
import { API_URL } from "../../../config";
import { api } from "../../../utils/axiosConfig";
import { installSettlingAdapter } from "./testAxios";

describe("network guard", () => {
  it("API_URL resolves to the dead loopback address under test", () => {
    expect(API_URL).toBe("http://127.0.0.1:1/api");
  });

  describe("unmocked request guard", () => {
    afterEach(() => {
      delete api.defaults.adapter;
    });

    it("rejects an unmocked request immediately with method and URL in the message", async () => {
      const failure = (await api
        .get("/sessions")
        .catch((error) => error)) as AxiosError;

      expect(failure.code).toBe("ERR_UNMOCKED_REQUEST");
      expect(failure.message).toMatch(
        /GET http:\/\/127\.0\.0\.1:1\/api\/sessions/,
      );
      expect(failure.message).toMatch(/installSettlingAdapter/);
    });

    it("a POST variant locks the method naming in the message", async () => {
      const failure = (await api
        .post("/sessions")
        .catch((error) => error)) as AxiosError;

      expect(failure.code).toBe("ERR_UNMOCKED_REQUEST");
      expect(failure.message).toMatch(
        /POST http:\/\/127\.0\.0\.1:1\/api\/sessions/,
      );
    });

    it("guard error is not retried by the transport layer", async () => {
      const started = Date.now();
      const failure = (await api
        .get("/sessions")
        .catch((error) => error)) as AxiosError;
      const elapsed = Date.now() - started;

      expect(failure.response?.status).toBe(418);
      expect(
        (failure.config as { retryCount?: number } | undefined)?.retryCount,
      ).toBeFalsy();
      // The transport's first backoff is 1000ms; an instant rejection proves
      // the retry branch never ran.
      expect(elapsed).toBeLessThan(200);
    });

    it("guard survives the shared afterEach teardown", async () => {
      // Reproduces the exact post-teardown state: every existing suite's
      // afterEach does `delete api.defaults.adapter`, which must land on
      // the guard rather than the real XHR adapter. Seed the instance with
      // the adapter list axios.create() originally copied onto it, so the
      // delete has something real to remove — otherwise it is a no-op and
      // this test proves nothing beyond the unguarded case above.
      api.defaults.adapter = ["xhr", "http", "fetch"];
      delete api.defaults.adapter;

      const failure = (await api
        .get("/sessions")
        .catch((error) => error)) as AxiosError;

      expect(failure.code).toBe("ERR_UNMOCKED_REQUEST");
    });

    it("explicit test adapters still take precedence over the guard", async () => {
      installSettlingAdapter(api, () => ({
        status: 200,
        data: { ok: true },
      }));

      await expect(api.get("/sessions")).resolves.toMatchObject({
        status: 200,
        data: { ok: true },
      });
    });
  });
});
