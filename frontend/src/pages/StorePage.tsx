import { useEffect, useState } from "react"
import Crate from "../components/Crate"

export default function StorePage() {
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  return (
    <div className="flex flex-col gap-2 mt-5">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-bold text-3xl">Welcome to the Store!</h1>
        <p>
          Here you can buy crates of Consumer, Industrial, and Mil-Spec quality
          <br/>skins to use in Trade Ups.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">

        <h1 className="font-bold text-xl ml-4.5">Crates containing 3 skins:</h1>
        <div className="flex justify-start ml-4">
          <div className="flex gap-6">
            <Crate crateId="1" name="Series Zero Core" amount={3} setErrorMessage={setErrorMessage} />
            <Crate crateId="" name="Series Zero Prime" amount={3} setErrorMessage={setErrorMessage} />
            <Crate crateId="" name="Series Zero Prototype" amount={3} setErrorMessage={setErrorMessage} />
          </div>
        </div>

        <div className="divider"></div>

        <h1 className="font-bold text-xl ml-4.5">Crates containing 5 skins:</h1>
        <div className="flex justify-start ml-4">
          <div className="flex gap-6">
            <Crate crateId="" name="Consumer Pack" amount={5} setErrorMessage={setErrorMessage} />
            <Crate crateId="" name="Industrial Pack" amount={5} setErrorMessage={setErrorMessage} />
            <Crate crateId="" name="Mil-Spec Pack" amount={5} setErrorMessage={setErrorMessage} />
          </div>
        </div>

      </div>

      {errorMessage && (
        <div className="toast toast-end">
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

    </div>
  )
}
