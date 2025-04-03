import { Link } from "react-router";


export default function Navbar() {
  return (
    <div className="navbar border-b bg-base-200 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl">Home</Link>
        <Link to="/tradeups" className="btn btn-ghost text-xl">Tradeups</Link>
      </div>
    </div>
  )
}
