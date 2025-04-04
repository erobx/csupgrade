import { create } from "zustand"

interface AuthState {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void
}

const useAuthStore = create<AuthState>()((set) => ({
  loggedIn: false,
  setLoggedIn: (loggedIn) => set(() => ({ loggedIn })),
}))

const useAuth = () => {
  const { loggedIn, setLoggedIn } = useAuthStore()
  return { loggedIn, setLoggedIn }
}

export default useAuth
