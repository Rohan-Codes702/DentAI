# DentAI Backend — Complete API Reference

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

---

## Health

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/health` | Public | Server liveness check |

---

## Auth — `/api/auth`

### POST `/auth/register`
Public. Creates a patient or dentist account.
```json
{
  "name": "Rohan Mane",
  "email": "rohan@test.com",
  "password": "test123",
  "role": "patient",       // "patient" | "dentist"
  "phone": "9876543210"    // optional
}
```
**201** → `{ success, token, user }`

### POST `/auth/login`
Public.
```json
{ "email": "rohan@test.com", "password": "test123" }
```
**200** → `{ success, token, user }`

### GET `/auth/me`
Private. Returns the logged-in user's profile.
**200** → `{ success, user }`

### PUT `/auth/update-password`
Private.
```json
{ "currentPassword": "test123", "newPassword": "newpass456" }
```
**200** → `{ success, message, token }` (new token issued)

### POST `/auth/logout`
Private. Clears auth cookie (client should also discard stored token).

---

## Patients — `/api/patients`

### GET `/patients/profile`
Private. Full profile of logged-in user.

### PUT `/patients/profile`
Private. Create/update medical profile.
```json
{
  "name": "Rohan Mane",
  "phone": "9876543210",
  "dateOfBirth": "1998-05-12",
  "gender": "male",
  "address": { "street": "...", "city": "Nashik", "state": "MH", "zip": "422001" },
  "bloodGroup": "O+",
  "allergies": ["penicillin"],
  "medicalHistory": ["diabetes"],
  "currentMedications": ["metformin"],
  "emergencyContact": { "name": "...", "phone": "...", "relation": "..." }
}
```
All fields optional — send only what you're updating.

### PUT `/patients/avatar`
Private. `multipart/form-data`, field name: `avatar` (image file).
**200** → `{ success, avatar: { url, publicId } }`

### GET `/patients/dentists`
Private (patient). Query params: `?specialization=Orthodontics&search=John`
**200** → `{ success, count, dentists: [...] }`

---

## Appointments — `/api/appointments`

### POST `/appointments`
Private (patient only).
```json
{
  "dentistId": "64f...",
  "date": "2026-08-01",
  "timeSlot": "10:00 AM - 10:30 AM",
  "reason": "Tooth pain",
  "location": { "type": "clinic", "address": "..." }
}
```
**201** → `{ success, appointment }` · **409** if slot already booked

### GET `/appointments`
Private. Returns own appointments (patient) or assigned ones (dentist).
Query: `?status=pending|confirmed|completed|cancelled|no_show`

### GET `/appointments/:id`
Private. Must be the patient or dentist on the appointment.

### PUT `/appointments/:id/status`
Private.
```json
{ "status": "confirmed", "cancellationReason": "optional, only if cancelling" }
```

### GET `/appointments/availability/:dentistId?date=2026-08-01`
Private. Returns open slots for that dentist on that date.
**200** → `{ success, date, availableSlots: [...] }`

---

## Diagnoses (core AI feature) — `/api/diagnoses`

### POST `/diagnoses`
Private (dentist only). `multipart/form-data`:
- `xray` — the X-ray image file
- `patientId` — required
- `appointmentId` — optional, marks appointment completed if provided

Flow: uploads to AI service `/predict` → uploads original + annotated image to Cloudinary → saves detections to MongoDB.

**201** →
```json
{
  "success": true,
  "diagnosis": {
    "_id": "...",
    "patient": "...", "dentist": "...",
    "xrayImage": { "url": "...", "publicId": "..." },
    "annotatedImage": { "url": "...", "publicId": "..." },
    "aiDetections": [ { "classId":0,"className":"Caries","confidence":0.91,"bbox":{...} } ],
    "aiSummary": { "totalFindings":4,"conditionsFound":[...],"urgentFindings":[...],"averageConfidence":0.68 },
    "status": "pending_review"
  }
}
```

### GET `/diagnoses`
Private. Own diagnoses (patient) or ones you created (dentist). Query: `?status=pending_review|confirmed|rejected`

### GET `/diagnoses/:id`
Private. Must be the patient or dentist involved.

### PUT `/diagnoses/:id/review`
Private (dentist only, must be the creator).
```json
{
  "confirmed": true,
  "notes": "Recommend filling for tooth #14, monitor impacted tooth.",
  "modifiedDetections": [ /* optional, same shape as aiDetections, if dentist edits AI output */ ],
  "status": "confirmed"
}
```

### DELETE `/diagnoses/:id`
Private (dentist who created it, or admin). Also deletes Cloudinary assets.

---

## Reports — `/api/reports`

### POST `/reports/:diagnosisId/generate`
Private (dentist only). Diagnosis must be `status: "confirmed"` first.
Generates PDF → uploads to Cloudinary → emails patient automatically.
**200** → `{ success, report: { url, publicId, generatedAt } }`

### GET `/reports/:diagnosisId`
Private. Patient or dentist on that diagnosis.
**200** → `{ success, report }` · **404** if not generated yet

---

## Chat — `/api/chat`

### GET `/chat/conversations`
Private. List of all conversations with last message + unread count.

### GET `/chat/:userId/messages`
Private. Message history with a specific user. Query: `?page=1&limit=30`
Auto-marks incoming messages as read.

### POST `/chat/:userId/messages`
Private. `multipart/form-data` (attachment optional) or JSON:
```json
{ "text": "Hello doctor" }
```
field name for file: `attachment`

---

## Socket.io (real-time chat)

Connect with JWT: `io("http://localhost:5000", { auth: { token: "<jwt>" } })`

| Event (emit) | Payload | Event (listen) | Payload |
|---|---|---|---|
| `sendMessage` | `{ receiverId, text, attachment }` (ack callback) | `newMessage` | populated message object |
| `typing` | `{ receiverId }` | `typing` | `{ userId }` |
| `stopTyping` | `{ receiverId }` | `stopTyping` | `{ userId }` |
| `markRead` | `{ conversationId }` | `messagesRead` | `{ conversationId, readBy }` |
| — | — | `userOnline` / `userOffline` | `{ userId }` |

---

## Typical end-to-end test sequence

1. `POST /auth/register` → create a dentist
2. `POST /auth/register` → create a patient
3. `PUT /patients/profile` (as patient) → fill medical profile
4. `POST /appointments` (as patient) → book with the dentist
5. `POST /diagnoses` (as dentist) → upload X-ray, run AI
6. `PUT /diagnoses/:id/review` (as dentist) → confirm diagnosis
7. `POST /reports/:diagnosisId/generate` (as dentist) → generate + email PDF
8. `GET /chat/conversations`, `POST /chat/:userId/messages` → message each other
