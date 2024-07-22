'use client'

import { useState, useEffect } from 'react'

interface Item {
  id: string
  name: string
  description: string
}

export default function ItemList() {
  const [items, setItems] = useState<Item[]>([])
  const [newItem, setNewItem] = useState({ name: '', description: '' })
  const [editItem, setEditItem] = useState<Item | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const response = await fetch('/api/items')
    const data = await response.json()
    setItems(data)
  }

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, id: Date.now().toString() }),
    })
    if (response.ok) {
      setNewItem({ name: '', description: '' })
      fetchItems()
    }
  }

  const updateItem = async (id: string) => {
    if (!editItem) return
    const response = await fetch(`/api/items?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editItem.name,
        description: editItem.description,
      }),
    })
    if (response.ok) {
      setEditItem(null)
      fetchItems()
    }
  }

  const deleteItem = async (id: string) => {
    const response = await fetch(`/api/items?id=${id}`, { method: 'DELETE' })
    if (response.ok) {
      fetchItems()
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items</h1>
      <form onSubmit={createItem} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Name"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            placeholder="Description"
            className="border p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Item
        </button>
      </form>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="border p-4 rounded shadow">
            {editItem && editItem.id === item.id ? (
              <div className="space-y-2">
                <input
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                  className="border p-2 w-full"
                />
                <input
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                  className="border p-2 w-full"
                />
                <div className="space-x-2">
                  <button
                    onClick={() => updateItem(item.id)}
                    className="bg-green-500 text-white py-1 px-3 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditItem(null)}
                    className="bg-gray-500 text-white py-1 px-3 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span>
                  {item.name} - {item.description}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setEditItem(item)}
                    className="bg-yellow-500 text-white py-1 px-3 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white py-1 px-3 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
