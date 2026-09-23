import client from "./client";

// openapi tag: documents

/** POST /api/documents/upload  (Bearer, multipart/form-data: file) → 201 DocumentOut */
export const uploadDocument = (file) => {
  const form = new FormData();
  form.append("file", file);
  return client.post("/api/documents/upload", form).then((r) => r.data);
};

/** GET /api/documents  (Bearer) → DocumentOut[] */
export const listDocuments = () => client.get("/api/documents").then((r) => r.data);

/** GET /api/documents/{document_id}/chunks  (Bearer) → DocumentChunkOut[] */
export const listDocumentChunks = (documentId) =>
  client.get(`/api/documents/${documentId}/chunks`).then((r) => r.data);

/** DELETE /api/documents/{document_id}  (Bearer) → 204 */
export const deleteDocument = (documentId) => client.delete(`/api/documents/${documentId}`);
