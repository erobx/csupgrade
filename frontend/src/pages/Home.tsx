import { NavLink, useNavigate } from "react-router"

function Home() {
  const navigate = useNavigate()
  const tradeupId = 1

  return (
    <div className="flex justify-center mt-5">
      <div className="flex text-center gap-2">
        <NavLink to="/tradeups" className="btn btn-soft btn-primary">Tradeups</NavLink>
        <button onClick={() => navigate(`/tradeups/${tradeupId}`)} className="btn btn-soft btn-secondary">Tradeups Id</button>
        <NavLink to="/inventory" className="btn btn-soft btn-primary">Inventory</NavLink>
      </div>
    </div>
  )
}

export default Home
