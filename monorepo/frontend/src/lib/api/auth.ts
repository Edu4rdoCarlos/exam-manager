import { apiRequest } from "./client";

export async function login(email: string, password: string): Promise<string> {
  const res = await apiRequest<{ data: { accessToken: string } }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return res.data.accessToken;
}
