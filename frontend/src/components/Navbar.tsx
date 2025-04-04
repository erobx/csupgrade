import { Link } from "react-router";
import useAuth from "../stores/authStore";
import Dropdown from "./Dropdown";

export default function Navbar() {
  const { loggedIn, setLoggedIn } = useAuth()

  return (
    <div className="navbar border-b bg-base-200 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">Home</Link>
        <Link to="/tradeups" className="btn btn-ghost text-xl">Tradeups</Link>
      </div>

      {!loggedIn && (
        <div className="navbar-end mr-1">
          <Link to="/store" className="btn btn-ghost text-xl">Store</Link>
          <Link to="/login" className="btn btn-ghost text-xl">Login</Link>
        </div>
      )}

      {loggedIn && (
          <div className="navbar-end mr-1">
            {/*<Balance balance={user.balance} />*/}
            <Link to="/store" className="btn btn-ghost text-lg">Store</Link>
            <Link to="/dashboard" className="btn btn-ghost text-lg">Dashboard</Link>
            <Dropdown
              setLoggedIn={setLoggedIn}
            />
          </div>
      )}
    </div>
  )
}
