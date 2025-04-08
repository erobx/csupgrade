import { useEffect } from "react"
import { useNotification } from "../stores/notificationStore"

export default function Notification() {
  const { notification, clearNotification } = useNotification()

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification, clearNotification])

  return (
    notification && (
      <div className="toast toast-end">
        <div className="alert alert-info">
          <span>{notification}</span>
        </div>
      </div>
    )
  )
}
