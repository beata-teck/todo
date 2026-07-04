"use client"

import { Todo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash2 } from "lucide-react"
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

type Props = {
  todo: Todo
  isSelected: boolean
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onSelect: (id: number) => void
  onEdit: (todo: Todo) => void
}

export default function TodoItem({
  todo,
  isSelected,
  onToggle,
  onDelete,
  onSelect,
  onEdit,
}: Props) {
  return (
    <div
      className={`flex items-start justify-between gap-2 p-2 rounded-lg border transition-colors ${
        isSelected
          ? "bg-destructive/10 border-destructive/30"
          : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-2 min-w-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(todo.id)}
        />
        <Checkbox
          checked={todo.done}
          onCheckedChange={() => onToggle(todo.id)}
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
          onClick={() => onEdit(todo)}
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
              <AlertDialogAction onClick={() => onDelete(todo.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
