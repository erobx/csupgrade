import useAuth from "../stores/authStore"

type CrateProps = {
  crateId: string;
  name: string;
  amount: number;
  setErrorMessage: (msg: string) => void;
}

export default function Crate({ crateId, name, amount, setErrorMessage }: CrateProps) {
  const { user, setBalance } = useAuth()

  const handleSubmit = async () => {
    const jwt = localStorage.getItem("jwt")
    if (user) {
      try {
        const res = await fetch(`
          http://localhost:8080/v1/store/buy?userId=${user.id}&crateId=${crateId}&amount=${amount}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (res.status === 500) {
          setErrorMessage("Insufficient funds")
          return
        }

        const data = await res.json()
        setBalance(data.balance)
      } catch (error) {
        console.error(error)
      }
    }
  }

  return (
    <div className="card card-md bg-base-300 w-68 shadow-sm">
      <div className="card-body">
        <h2 className="card-title">
          {name}
        </h2>
        <figure>
          <img src="crate.png" alt="" />
        </figure>
        <div className="card-actions">
          <button className="btn btn-primary" onClick={handleSubmit}>Buy crate</button>
        </div>
      </div>
    </div>
  )
}
