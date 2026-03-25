import { apiRequest } from "./client";
import type { Correction, GradeReport, HttpResponse, PaginatedResponse } from "../types";

export async function createCorrection(payload: {
  examId: string;
  correctionMode: "strict" | "lenient";
}): Promise<Correction> {
  const res = await apiRequest<HttpResponse<Correction>>("/corrections", {
    method: "POST",
    body: payload,
  });
  return res.data;
}

export async function getCorrection(id: string): Promise<Correction> {
  const res = await apiRequest<HttpResponse<Correction>>(`/corrections/${id}`);
  return res.data;
}

export async function applyCorrection(id: string): Promise<{ gradesCount: number }> {
  const res = await apiRequest<HttpResponse<{ gradesCount: number }>>(
    `/corrections/${id}/apply`,
    { method: "POST" }
  );
  return res.data;
}

export async function applyCorrectionFromCsv(
  id: string,
  file: File
): Promise<{ gradesCount: number }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiRequest<HttpResponse<{ gradesCount: number }>>(
    `/corrections/${id}/apply-from-csv`,
    { method: "POST", body: formData, isFormData: true }
  );
  return res.data;
}

export async function getCorrectionsByExam(examId: string): Promise<Correction[]> {
  const res = await apiRequest<PaginatedResponse<Correction>>(`/corrections?examId=${examId}`);
  return res.data;
}

export async function getGradeReport(correctionId: string): Promise<GradeReport[]> {
  const res = await apiRequest<PaginatedResponse<GradeReport>>(
    `/grades/report/correction/${correctionId}`
  );
  return res.data;
}
