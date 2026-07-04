"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { todoSchema, TodoFormValues } from "@/lib/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Todo } from "@/lib/types"

type Props = {
  onAdd: (todo: Todo) => void
}

export default function TodoForm({ onAdd }: Props) {
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema as any),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  function onSubmit(values: TodoFormValues) {
    const newTodo: Todo = {
      id: Date.now(),
      title: values.title,
      description: values.description || "",
      done: false,
    }
    onAdd(newTodo)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Finish React assignment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
  )
}
