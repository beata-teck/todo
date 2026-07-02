"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { z } from "zod"

const todoSchema = z.object({
  text: z.string().min(3, "Task must be at least 3 characters").max(100, "Task is too long"),
})

type Todo = {
  id: number
  text: string
  done: boolean
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [filter, setFilter] = useState("all")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(true)
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("todos")
    if (saved) {
      setTodos(JSON.parse(saved))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    const result = todoSchema.safeParse({ text: input })

    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setError(null)
    const newTodo = {
      id: Date.now(),
      text: input,
      done: false,
    }
    setTodos([...todos, newTodo])
    setInput("")
  }

  function toggleTodo(id: number) {
    const updated = todos.map((t) => {
      if (t.id === id) {
        return { ...t, done: !t.done }
      }
      return t
    })
    setTodos(updated)
  }

  function deleteTodo(id: number) {
    setTodos(todos.filter((t) => t.id !== id))
    setSelected(selected.filter((s) => s !== id))
  }

  function toggleSelect(id: number) {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id))
    } else {
      setSelected([...selected, id])
    }
  }

  function deleteSelected() {
    setTodos(todos.filter((t) => !selected.includes(t.id)))
    setSelected([])
  }

  let filteredTodos = todos
  if (filter === "active") {
    filteredTodos = todos.filter((t) => !t.done)
  } else if (filter === "completed") {
    filteredTodos = todos.filter((t) => t.done)
  }

  if (!showCompleted) {
    filteredTodos = filteredTodos.filter((t) => !t.done)
  }

  const activeCount = todos.filter((t) => !t.done).length

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          <p className="text-sm text-red-500">Loading your tasks...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex justify-center p-4 sm:p-8 sm:items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            My Todos
            <Badge variant="secondary">{activeCount} left</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addTodo()
                }}
                className="flex-1"
              />
              <Button onClick={addTodo}>Add</Button>
            </div>
            {error && (
              <p className="text-red-500 text-xs">{error}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Done</span>
              <Switch
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
            </div>
          </div>

          <Separator />

          {selected.length > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <span className="text-xs text-red-600">{selected.length} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 px-2 text-xs"
                onClick={deleteSelected}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete selected
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {filteredTodos.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No tasks here.
              </p>
            )}

            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between gap-2 p-2 rounded-lg border transition-colors ${
                  selected.includes(todo.id) ? "bg-red-50 border-red-200" : ""
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Checkbox
                    checked={selected.includes(todo.id)}
                    onCheckedChange={() => toggleSelect(todo.id)}
                  />
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <span
                    className={
                      todo.done
                        ? "text-sm truncate line-through text-gray-400"
                        : "text-sm truncate"
                    }
                  >
                    {todo.text}
                  </span>
                </div>

                <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 px-2 text-xs"
    >
      <Trash2 className="w-3 h-3 mr-1" />
      Delete selected
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete {selected.length} tasks?</AlertDialogTitle>
      <AlertDialogDescription>
        This can't be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={deleteSelected}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}