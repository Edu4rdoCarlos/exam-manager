import { apiRequest } from "./client";
import type { HttpResponse, UserMe } from "../types";

export async function getMe(): Promise<UserMe> {
  const res = await apiRequest<HttpResponse<UserMe>>("/users/me");
  return res.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<void> {
  await apiRequest("/users", { method: "POST", body: payload });
}
