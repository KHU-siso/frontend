import client from "./client";

// openapi tag: dashboard

/** GET /api/dashboard  (Bearer) → DashboardOut { user, document_count, conversation_count, recent_documents, recent_conversations } */
export const getDashboard = () => client.get("/api/dashboard").then((r) => r.data);
