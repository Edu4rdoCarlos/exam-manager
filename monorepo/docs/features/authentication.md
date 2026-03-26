# Authentication

## Overview

The system uses JWT-based authentication. All protected endpoints require a valid Bearer token in the `Authorization` header.

## Login

**Endpoint:** `POST /auth/login`

**Request body:**
```json
{
  "email": "teacher@example.com",
  "password": "secret"
}
```

**How it works:**
1. The system looks up the user by email.
2. The submitted password is hashed with SHA-256 and compared against the stored hash.
3. If both match, a signed JWT is returned.
4. If either check fails, a generic `InvalidCredentials` error is returned — the response never reveals whether the email or the password was wrong.

**Response:**
```json
{
  "accessToken": "<jwt>"
}
```

## Token structure

The JWT payload carries:

| Field | Description |
|-------|-------------|
| `sub` | User ID |
| `name` | User display name |
| `email` | User email |

## Protecting endpoints

All exam, question, correction, and grade endpoints are protected by `JwtAuthGuard`. The guard:

1. Extracts the Bearer token from the `Authorization` header.
2. Verifies the token signature.
3. Attaches the decoded payload to the request as `request.user`.
4. Throws `401 Unauthorized` if the token is missing or invalid.

Controllers access the authenticated user via the `@CurrentUser()` decorator, which reads the attached payload.
