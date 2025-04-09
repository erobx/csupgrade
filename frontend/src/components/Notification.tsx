import { useEffect } from "react"
import { useNotification } from "../stores/notificationStore"

export default function Notification() {
  const { notifications, removeNotification } = useNotification()

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notifications])

  return (
    <div className="toast toast-end z-40">
      {notifications.map((notification, index) => (
        notification !== "Insufficient funds" ? (
          <div key={index} className="alert alert-info">
            <span>{notification}</span>
          </div>
        ) : (
          <div key={index} className="alert alert-error">
            <span>{notification}</span>
          </div> 
        )
      ))}
    </div>
  )
}
