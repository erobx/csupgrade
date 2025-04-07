import { useEffect, useState } from "react"
import Crate from "../components/Crate"

export default function StorePage() {
  const [toastMessages, setToastMessages] = useState<string[]>([])

  useEffect(() => {
    if (!toastMessages || toastMessages.length === 0) return

    const timers = toastMessages.map((_, index) =>
    setTimeout(() => {
      setToastMessages((prev) => {
        const newMessages = [...prev];
        newMessages.splice(index, 1);
        return newMessages;
      });
    }, 3000)
  );

  return () => timers.forEach(clearTimeout);
  }, [toastMessages])

  const addToastMessage = (msg: string) => {
    setToastMessages(prev => [...prev, msg])
  }

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
            <Crate crateId="1" name="Series Zero Core" amount={3} setToastMessage={addToastMessage} />
            <Crate crateId="" name="Series Zero Prime" amount={3} setToastMessage={addToastMessage} />
            <Crate crateId="" name="Series Zero Prototype" amount={3} setToastMessage={addToastMessage} />
          </div>
        </div>

        <div className="divider"></div>

        <h1 className="font-bold text-xl ml-4.5">Crates containing 5 skins:</h1>
        <div className="flex justify-start ml-4">
          <div className="flex gap-6">
            <Crate crateId="" name="Consumer Pack" amount={5} setToastMessage={addToastMessage} />
            <Crate crateId="" name="Industrial Pack" amount={5} setToastMessage={addToastMessage} />
            <Crate crateId="" name="Mil-Spec Pack" amount={5} setToastMessage={addToastMessage} />
          </div>
        </div>

      </div>

      {toastMessages.length > 0 && (
        <div className="toast toast-end">
          {toastMessages.map((msg, index) => (
            <div key={index} className="alert alert-error">
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
