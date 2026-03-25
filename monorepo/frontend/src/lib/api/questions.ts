import { apiRequest } from "./client";
import type { HttpResponse, PaginatedResponse, Question } from "../types";

export async function getQuestions(
  page = 1,
  limit = 50
): Promise<PaginatedResponse<Question>> {
  const res = await apiRequest<PaginatedResponse<Question>>(
    `/questions?page=${page}&limit=${limit}`
  );
  return res;
}

export async function getQuestion(id: string): Promise<Question> {
  const res = await apiRequest<HttpResponse<Question>>(`/questions/${id}`);
  return res.data;
}

export async function createQuestion(payload: {
  statement: string;
  alternatives: { description: string; isCorrect: boolean }[];
}): Promise<Question> {
  const res = await apiRequest<HttpResponse<Question>>("/questions", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateQuestion(
  id: string,
  payload: {
    statement?: string;
    alternatives?: { description: string; isCorrect: boolean }[];
  }
): Promise<Question> {
  const res = await apiRequest<HttpResponse<Question>>(`/questions/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiRequest(`/questions/${id}`, { method: "DELETE" });
}
