export interface GradeReportStudent {
  readonly id: string;
  readonly name: string;
  readonly cpf: string;
}

export interface GradeReportExam {
  readonly id: string;
  readonly title: string;
  readonly subject: string;
}

export interface GradeReportExamVersion {
  readonly id: string;
  readonly versionNumber: number;
}

export interface GradeReport {
  readonly gradeId: string;
  readonly score: number;
  readonly correctionId: string;
  readonly student: GradeReportStudent;
  readonly exam: GradeReportExam;
  readonly examVersion: GradeReportExamVersion;
}
