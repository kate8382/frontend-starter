import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../api.js';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses JSON from GET', async () => {
    const payload = { hello: 'world' };
    const res = new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(res))
    );

    const client = new ApiClient('');
    const data = await client.get('/test');
    expect(data).toEqual(payload);
  });

  it('throws timeout ApiError when request takes too long', async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      'fetch',
      vi.fn((input, init) => {
        return new Promise((_, reject) => {
          const signal = init?.signal;
          if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
          const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
          signal?.addEventListener?.('abort', onAbort);
        });
      })
    );

    const client = new ApiClient('', 50);
    const p = client.get('/slow', { timeout: 50 });

    vi.advanceTimersByTime(100);

    await expect(p).rejects.toHaveProperty('message', 'Request timed out');

    vi.useRealTimers();
  });

  it('calls onAuthFailure hook for 401 responses', async () => {
    const body = JSON.stringify({ error: 'unauthorized' });
    const res = new Response(body, {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(res))
    );

    const client = new ApiClient('');
    const onAuth = vi.fn(async () => {
      return;
    });
    client.onAuthFailure = onAuth;

    const p = client.get('/private');
    await expect(p).rejects.toHaveProperty('status', 401);
    expect(onAuth).toHaveBeenCalled();
  });
});
