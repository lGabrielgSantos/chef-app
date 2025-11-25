import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");

        if (typeof document !== "undefined") {
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = (eqPos > -1 ? c.slice(0, eqPos) : c).trim();
            if (name) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            }
          });
        }

        set({ user: null, token: null });
        window.location.href = "/login";
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
