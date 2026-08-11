"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface Column<TData> {
  key: keyof TData | string
  header: string
  cell?: (row: TData) => React.ReactNode
}

interface DataTableProps<TData> {
  columns: Column<TData>[]
  data: TData[]
  searchKey?: keyof TData
  searchPlaceholder?: string
  pageSize?: number
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
}: DataTableProps<TData>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)

  const filtered = React.useMemo(() => {
    if (!searchKey || !search) return data
    return data.filter((row) =>
      String(row[searchKey] ?? "").toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search, searchKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-sm"
        />
      )}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? (
              paginated.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.cell
                        ? col.cell(row)
                        : String(row[col.key as keyof TData] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {pageCount}
        </span>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount - 1}>
          Next
        </Button>
      </div>
    </div>
  )
}
