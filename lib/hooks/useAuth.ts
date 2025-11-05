import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

export function useAuth() {
  const router = useRouter();
  const { setUser, setToken, logout, user } = useAuthStore();

  async function signIn(email: string, password: string) {
    try {
      const res = await login({ email, password });

      localStorage.setItem("token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);

      Cookies.set("token", res.access_token, { expires: 7 });

      setToken(res.access_token);
      setUser(res.user);

      router.push("/dashboard");
    } catch (err) {
      console.error("Erro ao logar:", err);
      throw err;
    }
  }

  function handleLogout() {
    Cookies.remove("token");
    logout();
    router.push("/login");
  }

  return { user, signIn, handleLogout };
}
