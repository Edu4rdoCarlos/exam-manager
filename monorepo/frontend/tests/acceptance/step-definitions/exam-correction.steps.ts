import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import { ExamManagerWorld, API_URL, API_KEY, TOKEN_KEY, FRONTEND_URL } from '../support/world';

// ─── World state extensions ───────────────────────────────────────────────────

declare module '../support/world' {
  interface ExamManagerWorld {
    authToken?: string;
    teacherId?: string;
    questionIds?: string[];
    examId?: string;
    versionId?: string;
    versionQuestions?: Array<{ id: string; position: number; questionId: string }>;
    answerKeys?: Array<{ examVersionQuestionId: string; correctAnswer: string }>;
    correctionId?: string;
    registeredCpfs?: Set<string>;
    studentIdByCpf?: Map<string, string>;
    lastGradesCount?: number;
    lastError?: Error | null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getToken(world: ExamManagerWorld): Promise<string> {
  if (world.authToken) return world.authToken;
  const token = await world.page.evaluate(
    (key: string) => localStorage.getItem(key) as string,
    TOKEN_KEY,
  );
  if (!token) throw new Error('No auth token found in localStorage');
  world.authToken = token;
  return token;
}

function decodeTeacherId(token: string): string {
  const payload = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString('utf-8'),
  ) as { sub: string };
  return payload.sub;
}

async function api<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-API-Key': API_KEY,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} ${path} → ${response.status}: ${text}`);
  }
  const json = (await response.json()) as { data: T };
  return json.data;
}

async function uploadCsv(
  token: string,
  correctionId: string,
  csvContent: string,
): Promise<{ gradesCount: number }> {
  const formData = new FormData();
  formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'answers.csv');
  const response = await fetch(`${API_URL}/corrections/${correctionId}/apply-from-csv`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-API-Key': API_KEY,
    },
    body: formData,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CSV upload → ${response.status}: ${text}`);
  }
  const json = (await response.json()) as { data: { gradesCount: number } };
  return json.data;
}

function buildCsv(rows: Array<{ cpf: string; versionId: string; answers: string[] }>): string {
  const header = 'cpf,examVersionId,answer1,...';
  const lines = rows.map((r) => [r.cpf, r.versionId, ...r.answers].join(','));
  return [header, ...lines].join('\n');
}

function normalizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

async function getOrCreateStudent(
  world: ExamManagerWorld,
  token: string,
  cpf: string,
  name: string,
): Promise<{ id: string; cpf: string }> {
  world.studentIdByCpf = world.studentIdByCpf ?? new Map();
  world.registeredCpfs = world.registeredCpfs ?? new Set();

  try {
    const student = await api<{ id: string; cpf: string }>(token, 'POST', '/students', { cpf, name });
    world.studentIdByCpf.set(cpf, student.id);
    world.registeredCpfs.add(cpf);
    return student;
  } catch {
    const students = await api<Array<{ id: string; cpf: string }>>(
      token,
      'GET',
      '/students?perPage=1000',
    );
    const found = students.find((s) => normalizeCpf(s.cpf) === normalizeCpf(cpf));
    if (!found) throw new Error(`Student with CPF ${cpf} not found after conflict`);
    world.studentIdByCpf.set(cpf, found.id);
    world.registeredCpfs.add(cpf);
    return found;
  }
}

async function getGradeForStudent(
  token: string,
  correctionId: string,
  cpf: string,
): Promise<{ score: number; student: { cpf: string }; exam: { title: string }; examVersion: { versionNumber: number } }> {
  const reports = await api<
    Array<{
      score: number;
      student: { id: string; name: string; cpf: string };
      exam: { id: string; title: string; subject: string };
      examVersion: { id: string; versionNumber: number };
    }>
  >(token, 'GET', `/grades/report/correction/${correctionId}`);

  const report = reports.find((r) => normalizeCpf(r.student.cpf) === normalizeCpf(cpf));
  if (!report) {
    const cpfs = reports.map((r) => r.student.cpf).join(', ');
    throw new Error(`No grade found for CPF ${cpf}. Available: [${cpfs}]`);
  }
  return report;
}

async function setupVersion(world: ExamManagerWorld, token: string): Promise<void> {
  const version = await api<{
    id: string;
    examVersionQuestions: Array<{ id: string; position: number; questionId: string }>;
  }>(token, 'POST', '/exam-versions', { examId: world.examId, versionNumber: 1 });

  world.versionId = version.id;
  world.versionQuestions = version.examVersionQuestions;

  world.answerKeys = await api<Array<{ examVersionQuestionId: string; correctAnswer: string }>>(
    token,
    'GET',
    `/answer-keys/exam-version/${version.id}`,
  );
}

function correctAnswerForQuestion(world: ExamManagerWorld, questionIndex: number): string {
  const sorted = [...(world.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
  const evq = sorted[questionIndex];
  const key = world.answerKeys?.find((k) => k.examVersionQuestionId === evq.id);
  return key?.correctAnswer ?? 'A';
}

function wrongAnswerFor(correct: string): string {
  return correct === 'Z' ? 'A' : 'Z';
}

// ─── Given: shared background ─────────────────────────────────────────────────

Given(
  'a question exists with statement {string} and correct alternative {string}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, statement: string, correctDescription: string) {
    const token = await getToken(this);

    const question = await api<{ id: string }>(token, 'POST', '/questions', {
      statement,
      alternatives: [
        { description: correctDescription, isCorrect: true },
        { description: 'Alternativa incorreta B', isCorrect: false },
        { description: 'Alternativa incorreta C', isCorrect: false },
        { description: 'Alternativa incorreta D', isCorrect: false },
      ],
    });

    this.questionIds = [...(this.questionIds ?? []), question.id];
  },
);

Given(
  'an exam exists with that question and answer format {string}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, answerFormat: string) {
    const token = await getToken(this);
    this.teacherId = decodeTeacherId(token);

    const exam = await api<{ id: string }>(token, 'POST', '/exams', {
      title: 'Prova de Correção Gherkin',
      subject: 'Testes Automatizados',
      teacherId: this.teacherId,
      answerFormat,
      questionIds: (this.questionIds ?? []).map((id, index) => ({
        questionId: id,
        position: index + 1,
      })),
    });

    this.examId = exam.id;
  },
);

Given(
  'a student is registered with CPF {string} and name {string}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, cpf: string, name: string) {
    const token = await getToken(this);
    await getOrCreateStudent(this, token, cpf, name);
  },
);

// ─── Given: version & answer key state ───────────────────────────────────────

Given('the exam has no versions yet', function (this: ExamManagerWorld) {
  // fresh exam from Background has no versions by default
});

Given('the exam has no versions', function (this: ExamManagerWorld) {
  // fresh exam from Background has no versions by default
});

Given(
  'the exam has 1 generated version with an answer key',
  { timeout: 20000 },
  async function (this: ExamManagerWorld) {
    const token = await getToken(this);
    await setupVersion(this, token);
  },
);

Given(
  'the exam has 1 generated version with an answer key for a {string} format exam',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, answerFormat: string) {
    const token = await getToken(this);
    this.teacherId ??= decodeTeacherId(token);

    const exam = await api<{ id: string }>(token, 'POST', '/exams', {
      title: `Prova Formato ${answerFormat} Gherkin`,
      subject: 'Testes Automatizados',
      teacherId: this.teacherId,
      answerFormat,
      questionIds: (this.questionIds ?? []).map((id, index) => ({
        questionId: id,
        position: index + 1,
      })),
    });

    this.examId = exam.id;
    await setupVersion(this, token);
  },
);

Given(
  'the exam has {int} questions with generated versions and answer keys',
  { timeout: 30000 },
  async function (this: ExamManagerWorld, totalQuestions: number) {
    const token = await getToken(this);
    this.teacherId ??= decodeTeacherId(token);

    const existing = this.questionIds?.length ?? 0;
    for (let i = existing; i < totalQuestions; i++) {
      const q = await api<{ id: string }>(token, 'POST', '/questions', {
        statement: `Questão ${i + 1} do Outline`,
        alternatives: [
          { description: `Resposta correta ${i + 1}`, isCorrect: true },
          { description: 'Errada B', isCorrect: false },
          { description: 'Errada C', isCorrect: false },
          { description: 'Errada D', isCorrect: false },
        ],
      });
      this.questionIds = [...(this.questionIds ?? []), q.id];
    }

    const exam = await api<{ id: string }>(token, 'POST', '/exams', {
      title: 'Prova Outline Gherkin',
      subject: 'Testes Automatizados',
      teacherId: this.teacherId,
      answerFormat: 'letters',
      questionIds: (this.questionIds ?? []).map((id, index) => ({
        questionId: id,
        position: index + 1,
      })),
    });

    this.examId = exam.id;
    await setupVersion(this, token);
  },
);

Given(
  'a correction exists for the exam in {string} mode',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, mode: string) {
    const token = await getToken(this);

    const correction = await api<{ id: string }>(token, 'POST', '/corrections', {
      examId: this.examId,
      correctionMode: mode,
    });

    this.correctionId = correction.id;
  },
);

// ─── When ─────────────────────────────────────────────────────────────────────

When(
  'I generate 1 version for the exam',
  { timeout: 15000 },
  async function (this: ExamManagerWorld) {
    const token = await getToken(this);
    await setupVersion(this, token);
  },
);

When(
  'I upload a CSV with the student CPF {string} answering all questions correctly',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const answers = sorted.map((q) => keyMap.get(q.id) ?? 'A');
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers }]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV with the student CPF {string} answering half of the questions correctly',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const half = Math.ceil(sorted.length / 2);
    const answers = sorted.map((q, i) => {
      const correct = keyMap.get(q.id) ?? 'A';
      return i < half ? correct : wrongAnswerFor(correct);
    });
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers }]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV with the student CPF {string} answering all questions incorrectly',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const answers = sorted.map((q) => wrongAnswerFor(keyMap.get(q.id) ?? 'A'));
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers }]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV with answers for both {string} and {string}',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf1: string, cpf2: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const answers = sorted.map((q) => keyMap.get(q.id) ?? 'A');
    const csv = buildCsv([
      { cpf: cpf1, versionId: this.versionId!, answers },
      { cpf: cpf2, versionId: this.versionId!, answers },
    ]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV where {string} answers correctly and {string} answers incorrectly',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, correctCpf: string, wrongCpf: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const correctAnswers = sorted.map((q) => keyMap.get(q.id) ?? 'A');
    const wrongAnswers = sorted.map((q) => wrongAnswerFor(keyMap.get(q.id) ?? 'A'));
    const csv = buildCsv([
      { cpf: correctCpf, versionId: this.versionId!, answers: correctAnswers },
      { cpf: wrongCpf, versionId: this.versionId!, answers: wrongAnswers },
    ]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV with the student CPF {string} answering with a valid subset',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    // For powers_of_two lenient mode, the exact correct answer is a valid subset of itself
    const answers = sorted.map((q) => keyMap.get(q.id) ?? '1');
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers }]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV with an unregistered CPF {string}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers: ['A'] }]);

    try {
      await uploadCsv(token, this.correctionId!, csv);
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'I upload a CSV referencing a non-existent exam version id',
  { timeout: 15000 },
  async function (this: ExamManagerWorld) {
    const token = await getToken(this);
    const fakeVersionId = '00000000-0000-0000-0000-000000000000';
    const cpf = this.registeredCpfs?.values().next().value ?? '111.222.333-44';
    const csv = buildCsv([{ cpf, versionId: fakeVersionId, answers: ['A'] }]);

    try {
      await uploadCsv(token, this.correctionId!, csv);
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'the student answers {int} out of {int} questions correctly',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, correctCount: number, _total: number) {
    const token = await getToken(this);
    const cpf = this.registeredCpfs?.values().next().value ?? '111.222.333-44';
    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const answers = sorted.map((q, i) => {
      const correct = keyMap.get(q.id) ?? 'A';
      return i < correctCount ? correct : wrongAnswerFor(correct);
    });
    const csv = buildCsv([{ cpf, versionId: this.versionId!, answers }]);

    try {
      const result = await uploadCsv(token, this.correctionId!, csv);
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

When(
  'the student {string} submits correct answers for all questions via API',
  { timeout: 20000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const studentId = this.studentIdByCpf?.get(cpf);
    assert.ok(studentId, `Student ID not found for CPF ${cpf} — was the student registered?`);

    const sorted = [...(this.versionQuestions ?? [])].sort((a, b) => a.position - b.position);
    const keyMap = new Map((this.answerKeys ?? []).map((k) => [k.examVersionQuestionId, k.correctAnswer]));
    const answers = sorted.map((vq) => ({
      questionId: vq.questionId,
      answer: keyMap.get(vq.id) ?? 'A',
    }));

    await api(token, 'POST', '/student-answers', {
      studentId,
      examVersionId: this.versionId,
      answers,
    });
  },
);

When(
  'I apply the correction',
  { timeout: 15000 },
  async function (this: ExamManagerWorld) {
    const token = await getToken(this);

    try {
      const result = await api<{ gradesCount: number }>(
        token,
        'POST',
        `/corrections/${this.correctionId}/apply`,
      );
      this.lastGradesCount = result.gradesCount;
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  },
);

// ─── Then ─────────────────────────────────────────────────────────────────────

Then(
  '{int} exam version should exist',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, expected: number) {
    await this.page.goto(`${FRONTEND_URL}/exams/${this.examId}`);
    await this.page.waitForSelector(`text=Versão 1`, { timeout: 10000 });
    const rows = this.page.locator('text=Versão').filter({ hasNot: this.page.locator('button') });
    const count = await rows.count();
    assert.ok(count >= expected, `Expected at least ${expected} version row(s), found ${count}`);
  },
);

Then(
  'an answer key should be automatically generated for that version',
  { timeout: 15000 },
  async function (this: ExamManagerWorld) {
    const token = await getToken(this);
    const versions = await api<Array<{ id: string }>>(
      token,
      'GET',
      `/exam-versions?examId=${this.examId}`,
    );
    assert.ok(versions.length > 0, 'Expected at least one exam version');

    const keys = await api<Array<{ correctAnswer: string }>>(
      token,
      'GET',
      `/answer-keys/exam-version/${versions[0].id}`,
    );
    assert.ok(keys.length > 0, 'Expected answer keys to be auto-generated with the version');
  },
);

Then('the correction should be applied successfully', function (this: ExamManagerWorld) {
  assert.strictEqual(
    this.lastError ?? null,
    null,
    `Expected no error but got: ${this.lastError?.message}`,
  );
});

Then(
  'the student {string} should have a score of {float}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, cpf: string, expectedScore: number) {
    const token = await getToken(this);
    const report = await getGradeForStudent(token, this.correctionId!, cpf);
    assert.strictEqual(
      report.score,
      expectedScore,
      `Expected score ${expectedScore} for CPF ${cpf}, got ${report.score}`,
    );
  },
);

Then(
  'the student {string} should have a score greater than 0.0 and less than 1.0',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const report = await getGradeForStudent(token, this.correctionId!, cpf);
    assert.ok(
      report.score > 0 && report.score < 1,
      `Expected score strictly between 0 and 1 for CPF ${cpf}, got ${report.score}`,
    );
  },
);

Then(
  'grades should be emitted for {int} students',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, expected: number) {
    const token = await getToken(this);
    const grades = await api<Array<{ score: number }>>(
      token,
      'GET',
      `/grades/correction/${this.correctionId}`,
    );
    assert.strictEqual(grades.length, expected, `Expected ${expected} grade(s), got ${grades.length}`);
  },
);

Then(
  'the student should have a score of {float}',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, expectedScore: number) {
    const token = await getToken(this);
    const cpf = this.registeredCpfs?.values().next().value ?? '111.222.333-44';
    const report = await getGradeForStudent(token, this.correctionId!, cpf);
    assert.strictEqual(
      report.score,
      expectedScore,
      `Expected score ${expectedScore} for CPF ${cpf}, got ${report.score}`,
    );
  },
);

Then(
  'the grade report for {string} should contain the exam title and version number',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, cpf: string) {
    const token = await getToken(this);
    const report = await getGradeForStudent(token, this.correctionId!, cpf);
    assert.ok(
      report.exam.title.length > 0,
      `Expected exam title to be present in grade report for CPF ${cpf}`,
    );
    assert.ok(
      report.examVersion.versionNumber > 0,
      `Expected version number to be present in grade report for CPF ${cpf}`,
    );
    assert.strictEqual(
      report.score,
      1.0,
      `Expected score 1.0 in grade report for CPF ${cpf}, got ${report.score}`,
    );
  },
);

Then(
  'the correction should fail with a student not found error',
  function (this: ExamManagerWorld) {
    assert.ok(this.lastError !== null, 'Expected an error but none was thrown');
    assert.ok(
      this.lastError!.message.includes('404') ||
        this.lastError!.message.toLowerCase().includes('student'),
      `Expected student not found error, got: ${this.lastError!.message}`,
    );
  },
);

Then(
  'the correction should fail with a version not found error',
  function (this: ExamManagerWorld) {
    assert.ok(this.lastError !== null, 'Expected an error but none was thrown');
    assert.ok(
      this.lastError!.message.includes('404') ||
        this.lastError!.message.toLowerCase().includes('version'),
      `Expected version not found error, got: ${this.lastError!.message}`,
    );
  },
);

Then(
  '{int} grades should be emitted',
  { timeout: 15000 },
  async function (this: ExamManagerWorld, expected: number) {
    assert.strictEqual(
      this.lastGradesCount ?? 0,
      expected,
      `Expected ${expected} grade(s) emitted, got ${this.lastGradesCount ?? 0}`,
    );
  },
);
