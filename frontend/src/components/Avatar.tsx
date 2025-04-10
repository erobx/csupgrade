import useAuth from "../stores/authStore"

export default function Avatar() {
  const { user } = useAuth()
  return (
    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle ml-1 avatar avatar-placeholder">
      <div className="bg-neutral text-neutral-content w-24 rounded-full">
        <span>{user?.username[0].toUpperCase()}</span>
      </div>
    </div>
  )
}
