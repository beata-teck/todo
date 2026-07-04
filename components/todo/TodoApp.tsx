"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Todo } from "@/lib/types"
import { TodoFormValues } from "@/lib/schema"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import TodoForm from "@/components/todo/TodoForm"
import TodoFilters from "@/components/todo/TodoFilters"
import TodoItem from "@/components/todo/TodoItem"
import BulkDeleteBanner from "@/components/todo/BulkDeleteBanner"
import TodoPagination from "@/components/todo/TodoPagination"
import EditDialog from "@/components/todo/EditDialog"

const ITEMS_PER_PAGE = 10

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(true)
  const [selected, setSelected] = useState<number[]>([])
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const saved = localStorage.getItem("todos_v2")
    if (saved) {
      try {
        setTodos(JSON.parse(saved))
      } catch {}
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    localStorage.setItem("todos_v2", JSON.stringify(todos))
  }, [todos])

  function addTodo(todo: Todo) {
    setTodos((prev) => [todo, ...prev])
    setCurrentPage(1)
  }

  function toggleTodo(id: number) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    setSelected((prev) => prev.filter((s) => s !== id))
  }

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  function deleteSelected() {
    setTodos((prev) => prev.filter((t) => !selected.includes(t.id)))
    setSelected([])
  }

  function saveEdit(id: number, values: TodoFormValues) {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, title: values.title, description: values.description || "" } : t
      )
    )
  }

  let filteredTodos = todos
  if (filter === "active") filteredTodos = filteredTodos.filter((t) => !t.done)
  else if (filter === "completed") filteredTodos = filteredTodos.filter((t) => t.done)
  if (!showCompleted) filteredTodos = filteredTodos.filter((t) => !t.done)
  if (search.trim()) {
    const query = search.toLowerCase()
    filteredTodos = filteredTodos.filter((t) =>
      `${t.title} ${t.description ?? ""}`.toLowerCase().includes(query)
    )
  }

  const activeCount = todos.filter((t) => !t.done).length
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE) || 1

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [filteredTodos.length, currentPage, totalPages])

  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your tasks...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted/40 text-foreground flex justify-center p-4 sm:p-8 sm:items-center transition-colors duration-200">
      <Card className="w-full max-w-2xl bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              My Todos
              <Badge variant="secondary">{activeCount} left</Badge>
            </div>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <TodoForm onAdd={addTodo} />

          <Separator />

          <TodoFilters
            filter={filter}
            setFilter={setFilter}
            search={search}
            setSearch={setSearch}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            onReset={() => setCurrentPage(1)}
          />

          <Separator />

          <BulkDeleteBanner count={selected.length} onDeleteSelected={deleteSelected} />

          <div className="space-y-2 min-h-[250px]">
            {filteredTodos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks here.
              </p>
            )}
            {paginatedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isSelected={selected.includes(todo.id)}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onSelect={toggleSelect}
                onEdit={setEditTodo}
              />
            ))}
          </div>

          {filteredTodos.length > ITEMS_PER_PAGE && (
            <TodoPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </CardContent>
      </Card>

      <EditDialog
        editTodo={editTodo}
        onClose={() => setEditTodo(null)}
        onSave={saveEdit}
      />
    </main>
  )
}
