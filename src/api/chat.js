import client from "./client";

// openapi tag: chat

/** GET /api/chat/conversations  (Bearer) → ConversationOut[] */
export const listConversations = () => client.get("/api/chat/conversations").then((r) => r.data);

/** POST /api/chat/conversations  (Bearer) body: ConversationCreate { document_id?, title? } → 201 ConversationOut */
export const createConversation = ({ document_id = null, title = null } = {}) =>
  client.post("/api/chat/conversations", { document_id, title }).then((r) => r.data);

/** GET /api/chat/conversations/{conversation_id}/messages  (Bearer) → MessageOut[] */
export const listMessages = (conversationId) =>
  client.get(`/api/chat/conversations/${conversationId}/messages`).then((r) => r.data);

/** POST /api/chat/conversations/{conversation_id}/messages  (Bearer) body: MessageCreate { content } → 201 MessageOut */
export const sendMessage = (conversationId, content) =>
  client.post(`/api/chat/conversations/${conversationId}/messages`, { content }).then((r) => r.data);
