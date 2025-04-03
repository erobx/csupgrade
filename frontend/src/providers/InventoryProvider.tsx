import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { InventoryItem, Inventory } from "../types/inventory";

interface InventoryContextType {
  inventory: Inventory | null;
  addItem: (item: InventoryItem) => void;
  removeItem: (invId: string) => void;
  setItemVisibility: (invId: string, visible: boolean) => void;
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
      const res = await fetch(`/v1/inventory?userId=${userId}`)
      const data: Inventory = await res.json()
      setInventory(data)
    }
    if (userId) {
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
    <InventoryContext.Provider value={{ inventory, addItem, removeItem, setItemVisibility }}>
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
