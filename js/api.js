class ApiError extends Error {
  constructor(message, status, response, errorBody) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.errorBody = errorBody;
  }
}

export class ApiClient {
  constructor(baseUrl = '', defaultTimeout = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {};
    this.onAuthFailure = undefined;
  }

  serializeParams(params) {
    if (!params) return '';
    const parts = [];
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

  isJsonResponse(res) {
    const ct = res.headers.get('content-type');
    return ct && ct.includes('application/json');
  }

  async request(path, opts = {}) {
    const method = (opts.method || 'GET').toUpperCase();
    const params = opts.params;
    const expectJson = opts.expectJson === undefined ? true : opts.expectJson;
    const responseType = opts.responseType;

    const url = path.startsWith('http')
      ? path
      : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}${this.serializeParams(params)}`;

    const controller = new AbortController();
    const timeout = opts.timeout ?? this.defaultTimeout;
    const id = timeout ? setTimeout(() => controller.abort(), timeout) : null;

    const headers = new Headers(this.defaultHeaders);
    if (opts.headers) {
      const initHeaders = new Headers(opts.headers);
      initHeaders.forEach((v, k) => headers.set(k, v));
    }

    try {
      const res = await fetch(url, {
        ...opts,
        method,
        headers,
        signal: controller.signal,
      });

      if (res.status === 401 && typeof this.onAuthFailure === 'function') {
        try {
          await this.onAuthFailure(res);
        } catch {
          // swallow
        }
      }

      if (!res.ok) {
        let bodyText = null;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) bodyText = await res.json();
          else bodyText = await res.text();
          // eslint-disable-next-line prettier/prettier
        } catch { }
        throw new ApiError(
          bodyText && typeof bodyText === 'string' ? bodyText : `${res.status} ${res.statusText}`,
          res.status,
          res,
          bodyText
        );
      }

      if (!expectJson || responseType === 'text') {
        const text = await res.text();
        return text;
      }
      if (responseType === 'blob') {
        const blob = await res.blob();
        return blob;
      }

      if (!this.isJsonResponse(res)) {
        throw new ApiError('Expected JSON response', res.status, res);
      }
      const data = await res.json();
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw new ApiError('Request timed out');
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || 'Network error');
    } finally {
      if (id) clearTimeout(id);
    }
  }

  async get(path, opts = {}) {
    return this.request(path, { ...opts, method: 'GET' });
  }
  async post(path, body, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    return this.request(path, { ...opts, method: 'POST', headers, body: JSON.stringify(body) });
  }
  async put(path, body, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    return this.request(path, { ...opts, method: 'PUT', headers, body: JSON.stringify(body) });
  }
  async patch(path, body, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    return this.request(path, { ...opts, method: 'PATCH', headers, body: JSON.stringify(body) });
  }
  async delete(path, opts = {}) {
    return this.request(path, { ...opts, method: 'DELETE' });
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/$/, '');
  }
  setHeader(name, value) {
    if (value === null) delete this.defaultHeaders[name];
    else this.defaultHeaders[name] = value;
  }
  setAuth(token) {
    if (!token) delete this.defaultHeaders['Authorization'];
    else this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  clearAuth() {
    delete this.defaultHeaders['Authorization'];
  }

  async getJSON(path) {
    return this.get(path);
  }
  async postJSON(path, body) {
    return this.post(path, body);
  }
}

const api = new ApiClient('');
export default api;
