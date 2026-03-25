import { PrismaClient } from '../src/generated/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  await prisma.grade.deleteMany();
  await prisma.answerKey.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.correction.deleteMany();
  await prisma.examVersionAlternative.deleteMany();
  await prisma.examVersionQuestion.deleteMany();
  await prisma.examVersion.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  const teacher = await prisma.user.create({
    data: {
      name: 'Prof. Silva',
      email: 'rofepssor@exam.com',
      passwordHash: hashPassword('senha123'),
    },
  });

  const q1 = await prisma.question.create({
    data: {
      statement: 'Qual é a capital do Brasil?',
      alternatives: {
        create: [
          { description: 'São Paulo', isCorrect: false },
          { description: 'Brasília', isCorrect: true },
          { description: 'Rio de Janeiro', isCorrect: false },
          { description: 'Salvador', isCorrect: false },
        ],
      },
    },
    include: { alternatives: true },
  });

  const q2 = await prisma.question.create({
    data: {
      statement: 'Quanto é 2 + 2?',
      alternatives: {
        create: [
          { description: '3', isCorrect: false },
          { description: '4', isCorrect: true },
          { description: '5', isCorrect: false },
          { description: '22', isCorrect: false },
        ],
      },
    },
    include: { alternatives: true },
  });

  const q3 = await prisma.question.create({
    data: {
      statement: 'Qual linguagem é usada para estilizar páginas web?',
      alternatives: {
        create: [
          { description: 'Python', isCorrect: false },
          { description: 'Java', isCorrect: false },
          { description: 'CSS', isCorrect: true },
          { description: 'SQL', isCorrect: false },
        ],
      },
    },
    include: { alternatives: true },
  });

  const q4 = await prisma.question.create({
    data: {
      statement: 'Qual é o maior planeta do sistema solar?',
      alternatives: {
        create: [
          { description: 'Saturno', isCorrect: false },
          { description: 'Júpiter', isCorrect: true },
          { description: 'Netuno', isCorrect: false },
          { description: 'Urano', isCorrect: false },
        ],
      },
    },
    include: { alternatives: true },
  });

  const q5 = await prisma.question.create({
    data: {
      statement: 'Em que ano o Brasil foi descoberto?',
      alternatives: {
        create: [
          { description: '1492', isCorrect: false },
          { description: '1500', isCorrect: true },
          { description: '1520', isCorrect: false },
          { description: '1488', isCorrect: false },
        ],
      },
    },
    include: { alternatives: true },
  });

  const exam = await prisma.exam.create({
    data: {
      title: 'Prova de Conhecimentos Gerais',
      subject: 'Conhecimentos Gerais',
      teacherId: teacher.id,
      examDate: new Date('2026-04-15'),
      answerFormat: 'letters',
      examQuestions: {
        create: [
          { questionId: q1.id, position: 1 },
          { questionId: q2.id, position: 2 },
          { questionId: q3.id, position: 3 },
          { questionId: q4.id, position: 4 },
          { questionId: q5.id, position: 5 },
        ],
      },
    },
  });

  const questions = [q1, q2, q3, q4, q5];
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  const labels = ['A', 'B', 'C', 'D'];

  const version = await prisma.examVersion.create({
    data: {
      examId: exam.id,
      versionNumber: 1,
      examVersionQuestions: {
        create: shuffled.map((q, idx) => ({
          questionId: q.id,
          position: idx + 1,
          examVersionAlternatives: {
            create: [...q.alternatives]
              .sort(() => Math.random() - 0.5)
              .map((alt, altIdx) => ({
                alternativeId: alt.id,
                position: altIdx + 1,
                label: labels[altIdx],
              })),
          },
        })),
      },
    },
    include: {
      examVersionQuestions: {
        include: { examVersionAlternatives: true },
      },
    },
  });

  const correctAnswerMap = new Map<string, string>();
  for (const q of questions) {
    const correctAlt = q.alternatives.find((a) => a.isCorrect)!;
    const versionQ = version.examVersionQuestions.find(
      (vq) => vq.questionId === q.id
    )!;
    const versionAlt = versionQ.examVersionAlternatives.find(
      (va) => va.alternativeId === correctAlt.id
    )!;
    correctAnswerMap.set(versionQ.id, versionAlt.label);
  }

  await prisma.answerKey.createMany({
    data: version.examVersionQuestions.map((vq) => ({
      examVersionId: version.id,
      examVersionQuestionId: vq.id,
      correctAnswer: correctAnswerMap.get(vq.id)!,
    })),
  });

  const students = await Promise.all([
    prisma.student.create({ data: { name: 'Ana Souza', cpf: '11122233344' } }),
    prisma.student.create({ data: { name: 'Bruno Lima', cpf: '22233344455' } }),
    prisma.student.create({ data: { name: 'Carla Dias', cpf: '33344455566' } }),
  ]);

  const correction = await prisma.correction.create({
    data: {
      examId: exam.id,
      correctionMode: 'strict',
    },
  });

  for (const student of students) {
    const answers = version.examVersionQuestions.map((vq) => ({
      studentId: student.id,
      examVersionId: version.id,
      questionId: vq.questionId,
      answer: correctAnswerMap.get(vq.id)!,
    }));
    await prisma.studentAnswer.createMany({ data: answers });

    await prisma.grade.create({
      data: {
        studentId: student.id,
        examVersionId: version.id,
        correctionId: correction.id,
        score: 1.0,
      },
    });
  }

  console.log('Seed concluído:');
  console.log(`  Professor: ${teacher.email} / senha123`);
  console.log(`  Questões:  ${questions.length}`);
  console.log(`  Prova:     ${exam.title}`);
  console.log(`  Versão:    ${version.versionNumber}`);
  console.log(`  Alunos:    ${students.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
