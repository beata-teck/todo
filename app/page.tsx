"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Search,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

const todoSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),
  description: z
    .string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),
})

type TodoFormValues = z.infer<typeof todoSchema>

type Todo = {
  id: number
  title: string
  description?: string
  done: boolean
}

const ITEMS_PER_PAGE = 10

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(true)
  const [selected, setSelected] = useState<number[]>([])
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Create form (add task)
  const createForm = useForm<TodoFormValues>({
    // cast to any to avoid Zod version mismatch between resolver and schema
    resolver: zodResolver(todoSchema as any),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  // Edit form (update task)
  const editForm = useForm<TodoFormValues>({
    // cast to any to avoid Zod version mismatch between resolver and schema
    resolver: zodResolver(todoSchema as any),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  // Avoid hydration mismatch for theme and client-only stuff
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load todos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos_v2")
    if (saved) {
      try {
        const parsed: Todo[] = JSON.parse(saved)
        setTodos(parsed)
      } catch {
        // ignore parse errors
      }
    }
    setLoading(false)
  }, [])

  // Persist todos to localStorage
  useEffect(() => {
    localStorage.setItem("todos_v2", JSON.stringify(todos))
  }, [todos])

  function onCreateSubmit(values: TodoFormValues) {
    const newTodo: Todo = {
      id: Date.now(),
      title: values.title,
      description: values.description || "",
      done: false,
    }
    setTodos((prev) => [newTodo, ...prev])
    setCurrentPage(1)
    createForm.reset()
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
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

  function openEdit(todo: Todo) {
    setEditTodo(todo)
    // set default values into the edit form
    editForm.reset({
      title: todo.title,
      description: todo.description || "",
    })
  }

  function onEditSubmit(values: TodoFormValues) {
    if (!editTodo) return
    setTodos((prev) =>
      prev.map((t) =>
        t.id === editTodo.id
          ? {
              ...t,
              title: values.title,
              description: values.description || "",
            }
          : t
      )
    )
    setEditTodo(null)
  }

  // Filtering and search
  let filteredTodos = todos

  if (filter === "active") {
    filteredTodos = filteredTodos.filter((t) => !t.done)
  } else if (filter === "completed") {
    filteredTodos = filteredTodos.filter((t) => t.done)
  }

  if (!showCompleted) {
    filteredTodos = filteredTodos.filter((t) => !t.done)
  }

  if (search.trim()) {
    const query = search.toLowerCase()
    filteredTodos = filteredTodos.filter((t) =>
      `${t.title} ${t.description ?? ""}`.toLowerCase().includes(query)
    )
  }

  const activeCount = todos.filter((t) => !t.done).length
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE) || 1

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
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
                onClick={() =>
                  setTheme(theme === "dark" ? "light" : "dark")
                }
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Create task form */}
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-3"
            >
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Finish React assignment"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add more details about the task..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Add task</Button>
              </div>
            </form>
          </Form>

          <Separator className="bg-border" />

          {/* Search + filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Tabs
                value={filter}
                onValueChange={(val) => {
                  setFilter(val)
                  setCurrentPage(1)
                }}
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show done</span>
                <Switch
                  checked={showCompleted}
                  onCheckedChange={(checked) => {
                    setShowCompleted(checked)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Bulk delete banner */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 transition-colors">
              <span className="text-xs text-destructive font-medium">
                {selected.length} selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/15 h-7 px-2 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete selected
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete {selected.length} tasks?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This can&apos;t be undone.
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
          )}

          {/* Todo list */}
          <div className="space-y-2 min-h-[250px]">
            {filteredTodos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No tasks here.
              </p>
            )}

            {paginatedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-start justify-between gap-2 p-2 rounded-lg border transition-colors ${
                  selected.includes(todo.id)
                    ? "bg-destructive/10 border-destructive/30"
                    : "border-border bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <Checkbox
                    checked={selected.includes(todo.id)}
                    onCheckedChange={() => toggleSelect(todo.id)}
                  />
                  <Checkbox
                    checked={todo.done}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <div className="flex flex-col min-w-0">
                    <span
                      className={
                        todo.done
                          ? "text-sm font-medium truncate line-through text-muted-foreground"
                          : "text-sm font-medium truncate text-foreground"
                      }
                    >
                      {todo.title}
                    </span>
                    {todo.description && (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {todo.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(todo)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This can&apos;t be undone.
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
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredTodos.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog with React Hook Form */}
      <Dialog
        open={!!editTodo}
        onOpenChange={(open) => {
          if (!open) {
            setEditTodo(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>

          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-3"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input placeholder="Edit task title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Edit task description..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTodo(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </main>
  )
}