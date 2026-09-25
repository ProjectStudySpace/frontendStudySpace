import { AxiosError } from "axios";
import type {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export type TestResponse = {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
};

export function responseLessFailure(
  config: InternalAxiosRequestConfig,
  message: string,
  code = "ERR_NETWORK",
): AxiosError {
  return new AxiosError(message, code, config, {});
}

export function installSettlingAdapter(
  client: AxiosInstance,
  handler: (
    config: InternalAxiosRequestConfig,
  ) => TestResponse | Promise<TestResponse>,
): void {
  client.defaults.adapter = async (config) => {
    const result = await handler(config as InternalAxiosRequestConfig);
    const response = {
      data: result.data,
      status: result.status,
      statusText: String(result.status),
      headers: result.headers ?? {},
      config,
      request: {},
    };
    const validateStatus = config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      return response;
    }
    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      response.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response as AxiosResponse,
    );
  };
}
