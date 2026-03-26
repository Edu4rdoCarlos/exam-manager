# Student Management

## Overview

Students are the individuals who take exams. Each student has a unique CPF (Brazilian tax ID) used as their identifier when processing bulk answer uploads.

---

## Endpoints

### Create a student

**Endpoint:** `POST /students`

```json
{
  "name": "Maria Silva",
  "cpf": "123.456.789-00"
}
```

**Business rules:**
- CPF must be unique. Attempting to create a second student with the same CPF returns a `CpfAlreadyInUse` error.

### Get a student

**Endpoint:** `GET /students/:id`

Returns the student's data or a `StudentNotFound` error if the ID does not exist.

---

## Student participation in exams

Students are not directly linked to exams at registration time. Their participation is recorded through answer submissions:

1. A student submits answers for a specific exam version (`POST /student-answers`), or answers are loaded from a CSV file during correction.
2. When correction runs, the system groups all submitted answers by student and calculates a score.
3. A `Grade` record is created for each student, linked to the correction session and exam version.

---

## Relationships summary

```
Student (id, name, cpf)
 └── StudentAnswer (one per question answered)
 └── Grade (one per correction session)
```
