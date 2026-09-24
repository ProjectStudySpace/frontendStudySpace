// Vitest setup: fail closed on any HTTP request that reaches the network
// layer without an explicit test adapter. axios resolves a request's adapter
// as `config.adapter || defaults.adapter`, where `defaults` is the
// module-level object that `axios.defaults` points at. Arming the guard
// there means it survives the `delete api.defaults.adapter` that every
// teardown in this suite performs.
import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { afterEach } from "vitest";
import { api } from "../utils/axiosConfig";

const unmockedRequestGuard = async (
  config: InternalAxiosRequestConfig,
): Promise<never> => {
  const method = (config.method ?? "get").toUpperCase();
  const url = config.url ?? "";
  const target = /^https?:\/\//.test(url) ? url : `${config.baseURL ?? ""}${url}`;
  // The synthetic response makes this non-retryable: the transport retries
  // only response-less failures, and 418 also fails its retry condition.
  const response = {
    data: null,
    status: 418,
    statusText: "Unmocked test request",
    headers: {},
    config,
    request: {},
  } as AxiosResponse;
  throw new AxiosError(
    `Unmocked HTTP request in test: ${method} ${target}. ` +
      "Tests must not reach the network. Install a test adapter in this " +
      "describe's beforeEach (see installSettlingAdapter in " +
      "src/features/intensive-study/api/testAxios.ts).",
    "ERR_UNMOCKED_REQUEST",
    config,
    {},
    response,
  );
};

function armNetworkGuard(): void {
  // Module-level fallback: survives `delete api.defaults.adapter`.
  axios.defaults.adapter = unmockedRequestGuard;
  // axios.create() copied the real adapter list onto the instance; remove it
  // so resolution falls through to the guard until a test installs a mock.
  delete api.defaults.adapter;
}

armNetworkGuard();

// Load-bearing, not decoration: the module-level fallback only applies while
// the instance has no adapter of its own, so this hook is what clears an
// adapter a test installed and never removed. Without it, one leaked adapter
// would silently serve every later test in the file. afterEach hooks run in
// reverse registration order and setup files register first, so this runs
// after every file-level teardown.
afterEach(() => {
  armNetworkGuard();
});
