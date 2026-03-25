import { apiRequest } from "./client";
import type { AnswerKey, HttpResponse } from "../types";

export async function getAnswerKeysByVersion(
  examVersionId: string
): Promise<AnswerKey[]> {
  const res = await apiRequest<HttpResponse<AnswerKey[]>>(
    `/answer-keys/exam-version/${examVersionId}`
  );
  return res.data;
}

export async function createAnswerKeys(payload: {
  examVersionId: string;
  keys: { examVersionQuestionId: string; correctAnswer: string }[];
}): Promise<AnswerKey[]> {
  const res = await apiRequest<HttpResponse<AnswerKey[]>>("/answer-keys", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export function getAnswerKeyCsvUrl(examVersionId: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  return `${apiUrl}/answer-keys/exam-version/${examVersionId}/csv`;
}
