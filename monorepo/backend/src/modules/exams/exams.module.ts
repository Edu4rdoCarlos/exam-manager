import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StudentModule } from '../students/student.module';

// Repositories
import { EXAM_REPOSITORY } from './application/exam/ports/ExamRepository';
import { EXAM_VERSION_REPOSITORY } from './application/versions/ports/ExamVersionRepository';
import { QUESTION_REPOSITORY } from './application/question/ports/QuestionRepository';
import { ANSWER_KEY_REPOSITORY } from './application/keys/ports/AnswerKeyRepository';
import { STUDENT_ANSWER_REPOSITORY } from './application/student-answer/ports/StudentAnswerRepository';
import { CORRECTION_REPOSITORY } from './application/corrections/ports/CorrectionRepository';
import { GRADE_REPOSITORY } from './application/grade/ports/GradeRepository';

// Output ports
import { EXAM_PDF_PORT } from './application/versions/ports/ExamPdfPort';
import { ANSWER_KEY_CSV_PORT } from './application/keys/ports/AnswerKeyCsvPort';
import { STUDENT_ANSWER_CSV_PARSER_PORT } from './application/student-answer/ports/StudentAnswerCsvParserPort';

// Infrastructure adapters
import { PrismaExamRepository } from './infrastructure/exam/PrismaExamRepository';
import { PrismaExamVersionRepository } from './infrastructure/versions/PrismaExamVersionRepository';
import { PrismaQuestionRepository } from './infrastructure/question/PrismaQuestionRepository';
import { PrismaAnswerKeyRepository } from './infrastructure/keys/PrismaAnswerKeyRepository';
import { PrismaStudentAnswerRepository } from './infrastructure/student-answer/PrismaStudentAnswerRepository';
import { PrismaCorrectionRepository } from './infrastructure/corrections/PrismaCorrectionRepository';
import { PrismaGradeRepository } from './infrastructure/grade/PrismaGradeRepository';
import { PdfMakeExamPdfAdapter } from './infrastructure/versions/PdfMakeExamPdfAdapter';
import { CsvAnswerKeyExportAdapter } from './infrastructure/keys/CsvAnswerKeyExportAdapter';
import { CsvStudentAnswerParserAdapter } from './infrastructure/student-answer/CsvStudentAnswerParserAdapter';

// Application services
import { CreateExam } from './application/exam/services/CreateExam';
import { GetExam } from './application/exam/services/GetExam';
import { GetExamsByTeacher } from './application/exam/services/GetExamsByTeacher';
import { UpdateExam } from './application/exam/services/UpdateExam';
import { DeleteExam } from './application/exam/services/DeleteExam';
import { CreateExamVersion } from './application/versions/services/CreateExamVersion';
import { GetExamVersion } from './application/versions/services/GetExamVersion';
import { GenerateExamVersionPdf } from './application/versions/services/GenerateExamVersionPdf';
import { CreateQuestion } from './application/question/services/CreateQuestion';
import { GetQuestion } from './application/question/services/GetQuestion';
import { GetAllQuestions } from './application/question/services/GetAllQuestions';
import { UpdateQuestion } from './application/question/services/UpdateQuestion';
import { DeleteQuestion } from './application/question/services/DeleteQuestion';
import { CreateAnswerKeys } from './application/keys/services/CreateAnswerKeys';
import { GetAnswerKeys } from './application/keys/services/GetAnswerKeys';
import { ExportAnswerKeyCsv } from './application/keys/services/ExportAnswerKeyCsv';
import { SubmitStudentAnswers } from './application/student-answer/services/SubmitStudentAnswers';
import { CreateCorrection } from './application/corrections/services/CreateCorrection';
import { GetCorrection } from './application/corrections/services/GetCorrection';
import { GetCorrectionsByExam } from './application/corrections/services/GetCorrectionsByExam';
import { ApplyCorrection } from './application/corrections/services/ApplyCorrection';
import { CorrectExamFromCsv } from './application/corrections/services/CorrectExamFromCsv';
import { GetGrades } from './application/grade/services/GetGrades';
import { GetGradeReport } from './application/grade/services/GetGradeReport';

// Controllers
import { ExamController } from './presentation/http/exam/ExamController';
import { ExamVersionController } from './presentation/http/versions/ExamVersionController';
import { QuestionController } from './presentation/http/question/QuestionController';
import { AnswerKeyController } from './presentation/http/keys/AnswerKeyController';
import { StudentAnswerController } from './presentation/http/student-answer/StudentAnswerController';
import { CorrectionController } from './presentation/http/corrections/CorrectionController';
import { GradeController } from './presentation/http/grade/GradeController';

@Module({
  imports: [AuthModule, StudentModule],
  controllers: [
    ExamController,
    ExamVersionController,
    QuestionController,
    AnswerKeyController,
    StudentAnswerController,
    CorrectionController,
    GradeController,
  ],
  providers: [
    { provide: EXAM_REPOSITORY, useClass: PrismaExamRepository },
    { provide: EXAM_VERSION_REPOSITORY, useClass: PrismaExamVersionRepository },
    { provide: QUESTION_REPOSITORY, useClass: PrismaQuestionRepository },
    { provide: ANSWER_KEY_REPOSITORY, useClass: PrismaAnswerKeyRepository },
    { provide: STUDENT_ANSWER_REPOSITORY, useClass: PrismaStudentAnswerRepository },
    { provide: CORRECTION_REPOSITORY, useClass: PrismaCorrectionRepository },
    { provide: GRADE_REPOSITORY, useClass: PrismaGradeRepository },
    { provide: EXAM_PDF_PORT, useClass: PdfMakeExamPdfAdapter },
    { provide: ANSWER_KEY_CSV_PORT, useClass: CsvAnswerKeyExportAdapter },
    { provide: STUDENT_ANSWER_CSV_PARSER_PORT, useClass: CsvStudentAnswerParserAdapter },
    CreateExam, GetExam, GetExamsByTeacher, UpdateExam, DeleteExam,
    CreateExamVersion, GetExamVersion, GenerateExamVersionPdf,
    CreateQuestion, GetQuestion, GetAllQuestions, UpdateQuestion, DeleteQuestion,
    CreateAnswerKeys, GetAnswerKeys, ExportAnswerKeyCsv,
    SubmitStudentAnswers,
    CreateCorrection, GetCorrection, GetCorrectionsByExam, ApplyCorrection, CorrectExamFromCsv,
    GetGrades, GetGradeReport,
  ],
  exports: [GetExamsByTeacher],
})
export class ExamsModule {}
