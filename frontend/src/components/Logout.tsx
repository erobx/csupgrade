import useAuth from "../stores/authStore"

export default function Logout({ setLoggedIn }: { setLoggedIn: (loggedIn: boolean) => void }) {
  const { setUser } = useAuth()
  // TODO: change for cookies when that finally works
  const handleLogout = async () => {
    localStorage.removeItem("jwt")
    setLoggedIn(false)
    setUser(null)
  }

  return (
      <span onClick={handleLogout}>Logout</span>
  )
}
