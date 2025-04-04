import { create } from "zustand"
import { User } from "../types/user";

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  setUser: (user: User | null) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loggedIn: false,
  setUser: (user) => set(() => ({ user })),
  setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
}))

const useAuth = () => {
  const { user, loggedIn, setUser, setLoggedIn } = useAuthStore()
  return { user, loggedIn, setUser, setLoggedIn }
}

export default useAuth
