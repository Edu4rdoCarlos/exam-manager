import { Inject, Injectable } from '@nestjs/common';
import { GradeReport } from '../../../domain/grade/GradeReport';
import { GradeRepository, GRADE_REPOSITORY } from '../ports/GradeRepository';
import { StudentRepository, STUDENT_REPOSITORY } from '../../../../students/application/ports/StudentRepository';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../../versions/ports/ExamVersionRepository';
import { ExamRepository, EXAM_REPOSITORY } from '../../exam/ports/ExamRepository';

@Injectable()
export class GetGradeReport {
  constructor(
    @Inject(GRADE_REPOSITORY) private readonly gradeRepository: GradeRepository,
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: StudentRepository,
    @Inject(EXAM_VERSION_REPOSITORY) private readonly examVersionRepository: ExamVersionRepository,
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
  ) {}

  async findByCorrection(correctionId: string): Promise<GradeReport[]> {
    const grades = await this.gradeRepository.findByCorrection(correctionId);

    const reports: GradeReport[] = [];

    for (const grade of grades) {
      const [student, version] = await Promise.all([
        this.studentRepository.findById(grade.studentId),
        this.examVersionRepository.findById(grade.examVersionId),
      ]);

      if (!student || !version) continue;

      const exam = await this.examRepository.findById(version.examId);
      if (!exam) continue;

      reports.push({
        gradeId: grade.id,
        score: grade.score,
        correctionId: grade.correctionId,
        student: { id: student.id, name: student.name, cpf: student.cpf },
        exam: { id: exam.id, title: exam.title, subject: exam.subject },
        examVersion: { id: version.id, versionNumber: version.versionNumber },
      });
    }

    return reports;
  }
}
