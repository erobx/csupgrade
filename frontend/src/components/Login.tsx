import { useNavigate } from "react-router"
import useAuth from "../stores/authStore"
import { useState } from "react"

const baseUrl = "http://localhost:8080/auth"

// {"username":"","email":"","password":""}
export const submitSignup = async (username: string, email: string, password: string) => {
    const user = {
        username: username,
        email: email,
        password: password,
    }

    const opts = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    }

    try {
        const res = await fetch(baseUrl+"/register", opts)
        const data = await res.json()
        return data
    } catch (error) {
        console.error('Error:', error)
    }
}

export const submitLogin = async (email: string, password: string) => {
    const creds = {
        email: email,
        password: password,
    }

    const opts = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(creds)
    }

    try {
        const res = await fetch(baseUrl+"/login", opts)
        const data = await res.json()
        return data
    } catch (error) {
        console.error('Error:', error)
    }
}


export default function Login() {
  const navigate = useNavigate()
  const { loggedIn, setLoggedIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    if (loading) return
    e.preventDefault()
    setLoading(true)

    try {
      const data = await submitLogin(email, password)
      if (data) {
        setLoggedIn(true)
        localStorage.setItem("jwt", data.JWT)
        navigate("/dashboard")
        resetForm()
      } else {
        console.error("Login failed. Please check your credentials.")
      }
    } catch (error) {
        console.error("Error during login:", error)
    } finally {
        setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
  }

  return (
    <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
      <legend className="fieldset-legend">Login</legend>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <label className="fieldset-label">Email</label>
          <input
            type="email"
            className="input validator" 
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="validator-hint hidden">Enter valid email address</div>
      
          <label className="fieldset-label">Password</label>
          <input
            type="password"
            className="input"
            required
            placeholder="Password"
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
      
          <button
            type="submit"
            className={`btn btn-neutral mt-4 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
      </form>
    </fieldset>
  )
}
