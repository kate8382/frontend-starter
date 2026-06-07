type ReqOptions = RequestInit & {
  timeout?: number;
  params?: Record<string, any>;
  expectJson?: boolean;
  responseType?: 'json' | 'text' | 'blob';
};

/**
 * ApiError extends Error with optional HTTP status, original Response and parsed error body.
 * This helps callers inspect response details for logging or advanced handling.
 */
class ApiError extends Error {
  status?: number;
  response?: Response;
  errorBody?: any;
  constructor(message: string, status?: number, response?: Response, errorBody?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.errorBody = errorBody;
  }
}

export class ApiClient {
  baseUrl: string;
  defaultTimeout: number;
  // reusable default headers applied to every request
  private defaultHeaders: Record<string, string> = {};
  // hook that can be set to handle 401 / auth failures (e.g. refresh token)
  // receives the original Response and can attempt token refresh or other handling
  onAuthFailure?: (res: Response) => Promise<void> | void;

  constructor(baseUrl = '', defaultTimeout = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeout = defaultTimeout;
  }

  /* Helper: serialize query params object to query string */
  private serializeParams(params?: Record<string, any>) {
    if (!params) return '';
    const parts: string[] = [];
    for (const key of Object.keys(params)) {
      const val = params[key];
      if (val === undefined || val === null) continue;
      if (Array.isArray(val)) {
        for (const v of val)
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`);
      }
    }
    return parts.length ? `?${parts.join('&')}` : '';
  }

  private isJsonResponse(res: Response) {
    const ct = res.headers.get('content-type');
    return ct && ct.includes('application/json');
  }

  /**
   * Core request method.
   * - path may be absolute URL or relative path
   * - options support params, timeout, expectJson and responseType
   */
  async request<T = any>(path: string, opts: ReqOptions = {}): Promise<T> {
    const method = (opts.method || 'GET').toUpperCase();
    const params = opts.params;
    const expectJson = opts.expectJson ?? true;
    const responseType = opts.responseType;

    const url = path.startsWith('http')
      ? path
      : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}${this.serializeParams(params)}`;

    const controller = new AbortController();
    const timeout = opts.timeout ?? this.defaultTimeout;
    const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    // merge headers: defaultHeaders <- opts.headers
    const headers = new Headers(this.defaultHeaders as Record<string, string>);
    if (opts.headers) {
      const initHeaders = new Headers(opts.headers as HeadersInit);
      initHeaders.forEach((v, k) => headers.set(k, v));
    }

    try {
      const res: Response = await fetch(url, {
        ...opts,
        method,
        headers,
        signal: controller.signal,
      });

      // If unauthorized and a hook exists, call it to allow refresh attempts
      if (res.status === 401 && typeof this.onAuthFailure === 'function') {
        try {
          // pass the Response to the hook so it can attempt refresh or logging
          await this.onAuthFailure(res);
        } catch {
          // swallow hook errors; will throw below
        }
      }

      if (!res.ok) {
        // try to get response body for better errors
        let bodyText: any = null;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) bodyText = await res.json();
          else bodyText = await res.text();
        } catch {
          // ignore parsing errors
        }
        throw new ApiError(
          (bodyText && typeof bodyText === 'string'
            ? bodyText
            : `${res.status} ${res.statusText}`) as string,
          res.status,
          res,
          bodyText
        );
      }

      // If caller doesn't expect JSON, return according to responseType or content-type
      if (!expectJson || responseType === 'text') {
        const text = await res.text();
        return text as unknown as T;
      }
      if (responseType === 'blob') {
        const blob = await res.blob();
        return blob as unknown as T;
      }

      // default: parse JSON
      if (!this.isJsonResponse(res)) {
        // if content-type is not JSON but caller expects JSON, throw helpful error
        throw new ApiError('Expected JSON response', res.status, res);
      }
      const data = await res.json();
      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') throw new ApiError('Request timed out');
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || 'Network error');
    } finally {
      if (id) clearTimeout(id);
    }
  }

  /* Convenience wrappers */
  async get<T = any>(path: string, opts: ReqOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'GET' });
  }

  async post<T = any>(path: string, body?: any, opts: ReqOptions = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...((opts.headers as Record<string, string>) || {}),
    };
    return this.request<T>(path, { ...opts, method: 'POST', headers, body: JSON.stringify(body) });
  }

  async put<T = any>(path: string, body?: any, opts: ReqOptions = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...((opts.headers as Record<string, string>) || {}),
    };
    return this.request<T>(path, { ...opts, method: 'PUT', headers, body: JSON.stringify(body) });
  }

  async patch<T = any>(path: string, body?: any, opts: ReqOptions = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...((opts.headers as Record<string, string>) || {}),
    };
    return this.request<T>(path, { ...opts, method: 'PATCH', headers, body: JSON.stringify(body) });
  }

  async delete<T = any>(path: string, opts: ReqOptions = {}) {
    return this.request<T>(path, { ...opts, method: 'DELETE' });
  }

  /* Helpers to configure client at runtime */
  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, '');
  }

  setHeader(name: string, value: string | null) {
    if (value === null) delete this.defaultHeaders[name];
    else this.defaultHeaders[name] = value;
  }

  setAuth(token: string | null) {
    if (!token) delete this.defaultHeaders['Authorization'];
    else this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  clearAuth() {
    delete this.defaultHeaders['Authorization'];
  }

  /* Convenience methods kept for backwards compatibility with earlier API */
  async getJSON<T = any>(path: string) {
    return this.get<T>(path);
  }

  async postJSON<T = any>(path: string, body: unknown) {
    return this.post<T>(path, body);
  }
}

const api = new ApiClient('');
export default api;
