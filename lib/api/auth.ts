import { api } from "./index";

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: User;
}

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await api.post("/auth/login", data);
  const payload = response.data?.data;

  if (!payload || !payload.access_token) {
    throw new Error("Invalid login response from server.");
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_type: payload.token_type,
    expires_in: payload.expires_in,
    expires_at: payload.expires_at,
    user: {
      id: payload.user.id,
      name: payload.user.user_metadata?.name ?? "Usuário",
      email: payload.user.email,
    },
  };
}

export async function getProfile(): Promise<User> {
  const response = await api.get("/auth/me");
  const user = response.data?.data?.user ?? response.data?.user;

  return {
    id: user.id,
    name: user.user_metadata?.name ?? "Usuário",
    email: user.email,
  };
}

export async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}
