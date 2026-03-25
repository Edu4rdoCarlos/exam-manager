import { apiRequest } from "./client";
import type { ExamVersion, HttpResponse, PaginatedResponse } from "../types";

export async function getVersionsByExam(
  examId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<ExamVersion>> {
  return apiRequest<PaginatedResponse<ExamVersion>>(
    `/exam-versions?examId=${examId}&page=${page}&limit=${limit}`
  );
}

export async function getVersion(id: string): Promise<ExamVersion> {
  const res = await apiRequest<HttpResponse<ExamVersion>>(
    `/exam-versions/${id}`
  );
  return res.data;
}

export async function createVersion(payload: {
  examId: string;
  versionNumber: number;
}): Promise<ExamVersion> {
  const res = await apiRequest<HttpResponse<ExamVersion>>("/exam-versions", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export function getVersionPdfUrl(id: string): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
  return `${apiUrl}/exam-versions/${id}/pdf`;
}
