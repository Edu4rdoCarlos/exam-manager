import { apiRequest } from "./client";

export async function submitStudentAnswers(payload: {
  studentId: string;
  examVersionId: string;
  answers: { questionId: string; answer: string }[];
}): Promise<void> {
  await apiRequest("/student-answers", { method: "POST", body: payload });
}
