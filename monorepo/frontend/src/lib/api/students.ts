import { apiRequest } from "./client";
import type { HttpResponse, PaginatedResponse, Student } from "../types";

export async function getStudents(
  page = 1,
  perPage = 20
): Promise<PaginatedResponse<Student>> {
  return apiRequest<PaginatedResponse<Student>>(
    `/students?page=${page}&perPage=${perPage}`
  );
}

export async function getStudent(id: string): Promise<Student> {
  const res = await apiRequest<HttpResponse<Student>>(`/students/${id}`);
  return res.data;
}

export async function createStudent(payload: {
  name: string;
  cpf: string;
}): Promise<Student> {
  const res = await apiRequest<HttpResponse<Student>>("/students", {
    method: "POST",
    body: payload,
  });
  return res.data;
}
