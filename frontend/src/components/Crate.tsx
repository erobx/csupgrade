import { useInventory } from "../providers/InventoryProvider";
import useAuth from "../stores/authStore"
import { useNotification } from "../stores/notificationStore";
import { InventoryItem } from "../types/inventory";

type CrateProps = {
  crateId: string;
  name: string;
  amount: number;
}

type Response = {
  balance: number;
  items: InventoryItem[];
}

export default function Crate({ crateId, name, amount }: CrateProps) {
  const { user, setBalance } = useAuth()
  const { addItem } = useInventory()
  const { addNotification } = useNotification()

  const handleSubmit = async () => {
    const jwt = localStorage.getItem("jwt")
    if (user) {
      try {
        const res = await fetch(`
          http://localhost:8080/v1/store/buy?userId=${user.id}&crateId=${crateId}&amount=${amount}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (res.status === 500) {
          addNotification("Insufficient funds")
          return
        }

        const data: Response = await res.json()
        if (data.items) {
          data.items.map(item => {
            addItem(item)
          })
          addNotification("Crate purchased successfully!")
        }

        setBalance(data.balance)
      } catch (error) {
        console.error(error)
        addNotification("An error occurred while purchasing the crate.")
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
