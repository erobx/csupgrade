import { Link } from "react-router"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className='flex flex-col items-center w-full flex-grow'> 
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
    <div className="hero bg-base-200 h-96">
      <div className="hero-content text-center justify-between">
        <h1 className="text-4xl font-bold">Over ....</h1>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content p-4 mt-auto w-full">
      <aside className="grid-flow-col items-center">
        <p>Copyright @ {new Date().getFullYear()} - All right reserved</p>
      </aside>
    </footer>
  )
}
