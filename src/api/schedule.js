import client from "./client";

// openapi tag: schedule

/** GET /api/events  (Bearer) → EventOut[] */
export const listEvents = () => client.get("/api/events").then((r) => r.data);

/** POST /api/events  (Bearer) body: EventCreate { title, date, start_time, end_time, memo? } → 201 EventOut */
export const createEvent = (event) => client.post("/api/events", event).then((r) => r.data);

/** GET /api/dashboard/priority  (Bearer) → PriorityChecklistItem[] */
export const getPriority = () => client.get("/api/dashboard/priority").then((r) => r.data);

/** GET /api/dashboard/notifications  (Bearer) → NotificationOut[] */
export const listNotifications = () => client.get("/api/dashboard/notifications").then((r) => r.data);

/** POST /api/notifications/{notification_id}/complete  (Bearer) → NotificationOut */
export const completeNotification = (notificationId) =>
  client.post(`/api/notifications/${notificationId}/complete`).then((r) => r.data);

/** GET /api/character  (Bearer) → CharacterStateOut { id, coin_balance, mood, updated_at } */
export const getCharacter = () => client.get("/api/character").then((r) => r.data);
