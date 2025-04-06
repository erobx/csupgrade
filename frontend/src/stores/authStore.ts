import { create } from "zustand"
import { User } from "../types/user";

interface AuthState {
  user: User | null;
  loggedIn: boolean;
  setUser: (user: User | null) => void;
  setBalance: (newBal: number) => void;
  setLoggedIn: (loggedIn: boolean) => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loggedIn: false,
  setUser: (user) => set(() => ({ user })),
  setBalance: (newBal) => set((state) => {
    if (!state.user) return state;
    return {
      ...state,
      user: {
        ...state.user,
        balance: newBal
      }
    }
  }),
  setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
}))

const useAuth = () => {
  const { user, loggedIn, setUser, setBalance, setLoggedIn } = useAuthStore()
  return { user, loggedIn, setUser, setBalance, setLoggedIn }
}

export default useAuth
