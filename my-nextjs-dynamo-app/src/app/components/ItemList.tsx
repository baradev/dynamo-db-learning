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
    <div>
      <h1>Items</h1>
      <form onSubmit={createItem}>
        <input
          type="text"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder="Name"
          required
        />
        <input
          type="text"
          value={newItem.description}
          onChange={(e) =>
            setNewItem({ ...newItem, description: e.target.value })
          }
          placeholder="Description"
          required
        />
        <button type="submit">Add Item</button>
      </form>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {editItem && editItem.id === item.id ? (
              <>
                <input
                  value={editItem.name}
                  onChange={(e) =>
                    setEditItem({ ...editItem, name: e.target.value })
                  }
                />
                <input
                  value={editItem.description}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                />
                <button onClick={() => updateItem(item.id)}>Save</button>
                <button onClick={() => setEditItem(null)}>Cancel</button>
              </>
            ) : (
              <>
                {item.name} - {item.description}
                <button onClick={() => setEditItem(item)}>Edit</button>
                <button onClick={() => deleteItem(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
