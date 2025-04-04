
export default function Logout({ setLoggedIn }: { setLoggedIn: (loggedIn: boolean) => void }) {
  // TODO: change for cookies when that finally works
  const handleLogout = async () => {
//    localStorage.removeItem("jwt")
    setLoggedIn(false)
  }

  return (
      <span onClick={handleLogout}>Logout</span>
  )
}
