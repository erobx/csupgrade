import { Link } from "react-router"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col flex-grow items-center w-full"> 
        <PageTop />
        <PageMiddle />
        <Footer />
      </div>
    </div>
  )
}

function PageTop() {
  return (
    <div className="hero bg-base-100 h-96">
      <div className="hero-content text-center justify-between">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">
            Trade Together, Win Big!
          </h1>
          <h2 className="text-xl py-4">
            Join forces with others to upgrade your skins. More players, more chances, better outcomes. Ready to trade up?
          </h2>
          <Link to="/login" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </div>
  )
}

function PageMiddle() {
  return (
    <div className="hero bg-base-200 flex-grow">
      <div className="hero-content text-center justify-between">
        <h1 className="text-4xl font-bold">Over ....</h1>
      </div>
    </div>
  )
}
