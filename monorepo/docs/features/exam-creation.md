# Exam Creation

## Overview

Creating a usable exam involves three steps: creating questions, assembling an exam from those questions, and generating one or more shuffled versions. Each version carries its own answer key, generated automatically.

---

## Step 1 — Create questions

**Endpoint:** `POST /questions`

A question contains a statement and a list of alternatives. Exactly one alternative must be marked as correct.

```json
{
  "statement": "What is the capital of France?",
  "alternatives": [
    { "description": "Berlin", "isCorrect": false },
    { "description": "Paris", "isCorrect": true },
    { "description": "Madrid", "isCorrect": false },
    { "description": "Rome", "isCorrect": false }
  ]
}
```

Questions are independent resources and can be reused across multiple exams.

Other question endpoints:
- `GET /questions` — list all questions
- `GET /questions/:id` — get a single question
- `PATCH /questions/:id` — update statement or alternatives
- `DELETE /questions/:id` — delete (fails if the question is used in any exam version)

---

## Step 2 — Create an exam

**Endpoint:** `POST /exams`

An exam groups questions in a defined order and sets the answer format used when grading.

```json
{
  "title": "Geography Midterm",
  "subject": "Geography",
  "teacherId": "<uuid>",
  "examDate": "2026-04-10T09:00:00.000Z",
  "answerFormat": "letters",
  "questionIds": [
    { "questionId": "<uuid>", "position": 1 },
    { "questionId": "<uuid>", "position": 2 }
  ]
}
```

**Answer format options:**

| Value | Labels generated | Example |
|-------|-----------------|---------|
| `letters` | A, B, C, D… | Student answers "A" or "BC" |
| `powers_of_two` | 1, 2, 4, 8… | Student answers "1" or "5" (sum of powers) |

Other exam endpoints:
- `GET /exams/:id` — get exam
- `PATCH /exams/:id` — update title, subject, date, or format
- `DELETE /exams/:id` — delete (fails if any version exists)

---

## Step 3 — Create an exam version

**Endpoint:** `POST /exam-versions`

```json
{
  "examId": "<uuid>",
  "versionNumber": 1
}
```

A version is a shuffled instance of the exam. Multiple versions can exist for the same exam so that students sitting next to each other receive different question and alternative orders.

**What happens internally:**
1. All questions for the exam are fetched.
2. Their order is shuffled using the Fisher-Yates algorithm.
3. For each question, its alternatives are also shuffled independently.
4. Labels are assigned to alternatives based on the exam's `answerFormat`.
5. The correct answer label for each question is recorded as an `AnswerKey` entry — no manual input needed.

**Output:** the full version structure, including every question's shuffled alternatives and their assigned labels.

Other version endpoints:
- `GET /exam-versions?examId=<id>` — list all versions for an exam
- `GET /exam-versions/:id` — get a specific version
- `GET /exam-versions/:id/pdf` — download the version as a PDF

---

## Answer keys

Answer keys are created automatically when a version is generated. They can also be overridden manually.

- `POST /answer-keys` — create or override keys
- `GET /answer-keys/exam-version/:id` — get all keys for a version
- `GET /answer-keys/exam-version/:id/csv` — export keys as CSV

---

## Relationships summary

```
Exam
 └── ExamQuestion (ordered list of questions)
 └── ExamVersion (one per shuffle)
      └── ExamVersionQuestion (question in shuffled position)
           └── ExamVersionAlternative (alternative with assigned label)
           └── AnswerKey (correct label for this question in this version)
```
