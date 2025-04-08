import { create } from "zustand";

type NotificationState = {
  notification: string;
  setNotification: (message: string) => void;
  clearNotification: () => void;
}

export const useNotification = create<NotificationState>((set) => ({
  notification: "",
  setNotification: (message: string) => set({ notification: message }),
  clearNotification: () => set({ notification: "" }),
}))
