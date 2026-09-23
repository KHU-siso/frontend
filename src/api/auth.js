import client from "./client";

// openapi tag: auth

/** POST /api/auth/signup  body: UserCreate { email, password, nickname } → 201 TokenOut */
export const signup = ({ email, password, nickname }) =>
  client.post("/api/auth/signup", { email, password, nickname }).then((r) => r.data);

/** POST /api/auth/login  body: UserLogin { email, password } → 200 TokenOut */
export const login = ({ email, password }) =>
  client.post("/api/auth/login", { email, password }).then((r) => r.data);

/** GET /api/auth/me  (Bearer) → UserOut */
export const getMe = () => client.get("/api/auth/me").then((r) => r.data);
