const opts: RequestInit = { credentials: "include" };

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  get: <T>(url: string) => fetch(url, opts).then((r) => json<T>(r)),
  post: <T>(url: string, body?: unknown) =>
    fetch(url, {
      ...opts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    }).then((r) => json<T>(r)),
  put: <T>(url: string, body: unknown) =>
    fetch(url, {
      ...opts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => json<T>(r)),
  patch: <T>(url: string, body: unknown) =>
    fetch(url, {
      ...opts,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => json<T>(r)),
  del: <T>(url: string) => fetch(url, { ...opts, method: "DELETE" }).then((r) => json<T>(r)),
};
