"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

type Todo = {
  id: number
  text: string
  done: boolean
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const saved = localStorage.getItem("todos")
    if (saved) {
      setTodos(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    if (input === "") return

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
  }

  let filteredTodos = todos
  if (filter === "active") {
    filteredTodos = todos.filter((t) => !t.done)
  } else if (filter === "completed") {
    filteredTodos = todos.filter((t) => t.done)
  }

  const activeCount = todos.filter((t) => !t.done).length

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
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo()
              }}
              className="flex-1"
            />
            <Button onClick={addTodo}>Add</Button>
          </div>

          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator />

          <div className="space-y-2">
            {filteredTodos.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No tasks here.
              </p>
            )}

            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg border"
              >
                <div className="flex items-center gap-2 min-w-0">
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
    <Button variant="ghost" size="icon">
      <Trash2 className="w-4 h-4 text-red-500" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete this task?</AlertDialogTitle>
      <AlertDialogDescription>
        This can't be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={() => deleteTodo(todo.id)}>
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