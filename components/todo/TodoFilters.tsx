"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

type Props = {
  filter: string
  setFilter: (val: string) => void
  search: string
  setSearch: (val: string) => void
  showCompleted: boolean
  setShowCompleted: (val: boolean) => void
  onReset: () => void
}

export default function TodoFilters({
  filter,
  setFilter,
  search,
  setSearch,
  showCompleted,
  setShowCompleted,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            onReset()
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Tabs
          value={filter}
          onValueChange={(val) => {
            setFilter(val)
            onReset()
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
              onReset()
            }}
          />
        </div>
      </div>
    </div>
  )
}
