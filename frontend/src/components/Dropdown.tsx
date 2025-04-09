import { Link } from "react-router"
import Logout from "./Logout"
import Avatar from "./Avatar"

export default function Dropdown({ setLoggedIn }: { setLoggedIn: (loggedIn: boolean) => void }) {
  const handleClick = () => {
    const elem = document.activeElement
    if (elem) {
      elem?.blur()
    }
  }

  return (
    <div className="dropdown dropdown-end">
      <Avatar />
      <ul
        tabIndex={0}
        className="menu menu-md dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
        <li><Link to="/dashboard/inventory" onClick={handleClick}>Inventory</Link></li>
        <li><Link to="/dashboard/settings" onClick={handleClick}>Settings</Link></li>
        <li>
          <Logout
            setLoggedIn={setLoggedIn}
          />
        </li>
      </ul>
    </div>
  )
}
