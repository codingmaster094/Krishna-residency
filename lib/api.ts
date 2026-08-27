async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  get: <T>(url: string) => fetch(url).then((r) => json<T>(r)),
  post: <T>(url: string, body?: unknown) =>
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) }).then((r) =>
      json<T>(r)
    ),
  put: <T>(url: string, body: unknown) =>
    fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) =>
      json<T>(r)
    ),
  patch: <T>(url: string, body: unknown) =>
    fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) =>
      json<T>(r)
    ),
  del: <T>(url: string) => fetch(url, { method: "DELETE" }).then((r) => json<T>(r)),
};
