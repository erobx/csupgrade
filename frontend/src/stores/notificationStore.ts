import { create } from "zustand";

export type Notification = {
  message: string;
  type: string;
}

type NotificationState = {
  notifications: Notification[];
  addNotification: (message: string, type: string) => void;
  removeNotification: (message: string) => void;
}

export const useNotification = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (message: string, type: string) =>
    set((state) => ({
      notifications: [...state.notifications, { message, type }],
    })),
  removeNotification: (message: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.message !== message),
    }))
}))
