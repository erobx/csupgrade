import { create } from "zustand";

type NotificationState = {
  notifications: string[];
  addNotification: (message: string) => void;
  removeNotification: (message: string) => void;
}

export const useNotification = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message: string) =>
    set((state) => ({
      notifications: [...state.notifications, message],
    })),
  removeNotification: (message: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n !== message),
    }))
}))
