# Correction

## Overview

Correction is the process of grading student answers against the answer keys. It runs per exam and produces a numeric score (0.0–1.0) for each student.

The process has two parts: collecting student answers, and applying a correction to grade them.

---

## Collecting student answers

### Option A — Submit via API

**Endpoint:** `POST /student-answers`

```json
{
  "studentId": "<uuid>",
  "examVersionId": "<uuid>",
  "answers": [
    { "questionId": "<uuid>", "answer": "A" },
    { "questionId": "<uuid>", "answer": "C" }
  ]
}
```

### Option B — Upload a CSV file

**Endpoint:** `POST /corrections/:id/apply-from-csv`

The CSV file contains one row per student. Each row includes the student's CPF, the exam version identifier, and their answers in question-position order. The system resolves the student by CPF, maps answers to questions, and saves them before grading.

---

## Applying correction

### Step 1 — Create a correction session

**Endpoint:** `POST /corrections`

```json
{
  "examId": "<uuid>",
  "correctionMode": "strict"
}
```

**Correction modes:**

| Mode | How it compares answers |
|------|------------------------|
| `strict` | Exact string match. Student must answer exactly what the key says (e.g., `"A"` only matches `"A"`). |
| `lenient` | Partial match allowed. For `letters` format, each character in the student's answer must be present in the correct answer set (e.g., `"A"` matches key `"ABD"`). For `powers_of_two` format, a bitwise AND check is used — the student's value must share at least one bit with the correct value. |

### Step 2 — Apply the correction

**Endpoint:** `POST /corrections/:id/apply`

The system:
1. Loads all exam versions for the exam.
2. For each version, loads the answer keys and all student answers.
3. Groups answers by student.
4. For each student, counts correct answers using the selected mode.
5. Calculates `score = correct_answers / total_questions`.
6. Saves a `Grade` record per student.

**Response:**
```json
{
  "gradesCount": 42
}
```

---

## Viewing results

| Endpoint | Description |
|----------|-------------|
| `GET /grades/exam-version/:id` | Grades for a specific exam version |
| `GET /grades/correction/:id` | All grades produced by a correction |
| `GET /grades/report/correction/:id` | Rich report: grade + student info + exam details |

---

## Relationships summary

```
Correction (mode, examId)
 └── Grade (studentId, examVersionId, score 0.0–1.0)

StudentAnswer (studentId, examVersionId, questionId, answer)

AnswerKey (examVersionQuestionId, correctAnswer label)
```
