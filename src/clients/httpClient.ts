export async function getJson<T>(baseUrl: string, path: string, init: RequestInit = {}): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...init,
    method: 'GET',
    headers: {
      accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET ${url} failed with ${res.status}: ${body.slice(0, 500)}`);
  }

  return (await res.json()) as T;
}
