import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  interface AxiosRequestConfigPlugins {
    allow404?: boolean
  }
  interface AxiosRequestConfig {
    plugins?: AxiosRequestConfigPlugins
  }
}

function validateStatusAllow404(status: number): boolean {
  // Allow 404 status code if the plugin is enabled
  return status === 404 || (status >= 200 && status < 300);
}

export function install(client: AxiosInstance): void {
  client.interceptors.request.use(
    (request: InternalAxiosRequestConfig) => {
      if (request.plugins?.allow404 === true) {
        request.validateStatus = validateStatusAllow404;
      }
      return request;
    }
  );
}
