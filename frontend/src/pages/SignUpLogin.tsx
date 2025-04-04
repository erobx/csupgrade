import { useState } from "react"
import Login from "../components/Login"
import SignUp from "../components/SignUp"

export default function SignUpLogin() {
  const [formState, setFormState] = useState("LOGIN")

  const handleFormChange = () => {
      if (formState === "LOGIN") {
          setFormState("SIGNUP")
      } else {
          setFormState("LOGIN")
      }
  }

  if (formState === "LOGIN") {
      return (
          <div className="flex flex-col gap-2 items-center justify-center">
              <Login />
              <div className="flex gap-1">
                  <p>Don't have an account?</p>
                  <a className="link link-info" onClick={handleFormChange}>Sign up here</a>
              </div>
          </div>
      )
  }

  return (
      <div className="flex flex-col gap-2 items-center justify-center">
          <h1 className="font-bold mt-5">
              Welcome to TradeUps!
          </h1>
          <SignUp />
          <div className="flex gap-1">
              <p>Already have an account?</p>
              <a className="link link-info" onClick={handleFormChange}>Login here</a>
          </div>
      </div>
  )
}
