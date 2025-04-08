import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { InventoryItem, Inventory } from "../types/inventory";

interface InventoryContextType {
  inventory: Inventory | null;
  addItem: (item: InventoryItem) => void;
  removeItem: (invId: string) => void;
  ownsItem: (invId: string) => boolean;
  setItemVisibility: (invId: string, visible: boolean) => void;
  setInventory: React.Dispatch<React.SetStateAction<Inventory | null>>;
}

const InventoryContext = createContext<InventoryContextType | null>(null)

interface InventoryProviderProps {
  children: ReactNode;
  userId: string;
}

export function InventoryProvider({ children, userId }: InventoryProviderProps) {
  const [inventory, setInventory] = useState<Inventory | null>(null)

  useEffect(() => {
    async function fetchInventory() {
      const jwt = localStorage.getItem("jwt")
      const res = await fetch(`http://localhost:8080/v1/users/inventory?userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      })
      const data: Inventory = await res.json()
      setInventory(data)
    }
    if (userId) {
      console.log("Fetching inventory...")
      fetchInventory()
    }
  }, [userId])

  function addItem(item: InventoryItem) {
    setInventory((prev) =>
      prev ? { ...prev, items: [...prev.items, item] } : null
    )
  }

  function removeItem(invId: string) {
    setInventory((prev) =>
      prev ? { ...prev, items: prev.items.filter((item) => item.invId !== invId) } : null
    )
  }
  function ownsItem(invId: string) {
    return inventory?.items.some((item) => item.invId === invId) ?? false
  }

  function setItemVisibility(invId: string, visible: boolean) {
    setInventory((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item) => (item.invId === invId ? { ...item, visible } : item)),
          }
        : null
    )
  }

  return (
    <InventoryContext.Provider value={{ inventory, addItem, removeItem, ownsItem, setItemVisibility, setInventory }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
