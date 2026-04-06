import { useAuthStore } from "../store/auth";

export const apiRequest = async <T>(
  path: string,
  options: RequestInit & { accessToken?: string | null } = {}
): Promise<T> => {
  const accessToken = options.accessToken ?? useAuthStore.getState().accessToken;
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
};

