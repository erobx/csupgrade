import { Link } from "react-router";
import useAuth from "../stores/authStore";
import Dropdown from "./Dropdown";
import Balance from "./Balance";

export default function Navbar() {
  const { user, loggedIn, setLoggedIn } = useAuth()

  return (
    <div className="navbar border-b bg-base-200 shadow-sm">
      <div className="navbar-start">
        {!loggedIn && (
          <Link to="/" className="btn btn-ghost text-xl">Home</Link>
        )}
        <Link to="/dashboard" className="btn btn-ghost text-lg">Dashboard</Link>
        <Link to="/tradeups" className="btn btn-ghost text-lg">Tradeups</Link>
        <Link to="/store" className="btn btn-ghost text-lg">Store</Link>
      </div>

      {!loggedIn && (
        <div className="navbar-end mr-1">
          <Link to="/login" className="btn btn-ghost text-xl">Login</Link>
        </div>
      )}

      {loggedIn && user && (
          <div className="navbar-end mr-1">
            <Balance balance={user.balance} />
            <Dropdown
              setLoggedIn={setLoggedIn}
            />
          </div>
      )}
    </div>
  )
}
