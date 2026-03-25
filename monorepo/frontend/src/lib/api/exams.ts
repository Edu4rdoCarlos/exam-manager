import { apiRequest } from "./client";
import type { Exam, HttpResponse } from "../types";

export async function getExam(id: string): Promise<Exam> {
  const res = await apiRequest<HttpResponse<Exam>>(`/exams/${id}`);
  return res.data;
}

export async function createExam(payload: {
  title: string;
  subject: string;
  teacherId: string;
  examDate?: string;
  answerFormat: "letters" | "powers_of_two";
  questionIds: { questionId: string; position: number }[];
}): Promise<Exam> {
  const res = await apiRequest<HttpResponse<Exam>>("/exams", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function updateExam(
  id: string,
  payload: {
    title?: string;
    subject?: string;
    examDate?: string;
    answerFormat?: "letters" | "powers_of_two";
    questionIds?: { questionId: string; position: number }[];
  }
): Promise<Exam> {
  const res = await apiRequest<HttpResponse<Exam>>(`/exams/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return res.data;
}

export async function deleteExam(id: string): Promise<void> {
  await apiRequest(`/exams/${id}`, { method: "DELETE" });
}
