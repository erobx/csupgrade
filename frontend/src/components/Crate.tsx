
export default function Crate({ name, rarity, count }: { name: string, rarity: string, count: number }) {
  const handleSubmit = async () => {
    try {
      //const jwt = localStorage.getItem("jwt")
      //const data = await buyCrate(jwt, name, rarity, count)
      // data {skins: [], balance: 0.00}
    } catch (error) {
      console.error(error)
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
