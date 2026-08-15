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
import { Search } from "lucide-react"

export interface Column<TData> {
  /** Column key — use `accessorKey` (preferred) or `key` (legacy) */
  accessorKey?: keyof TData | string
  key?: keyof TData | string
  header: string
  cell?: (row: TData) => React.ReactNode
}

interface DataTableProps<TData> {
  columns: Column<TData>[]
  data: TData[]
  /** Enable built-in search that filters across all string columns */
  searchable?: boolean
  /** Legacy: specific column key to search by */
  searchKey?: keyof TData
  searchPlaceholder?: string
  pageSize?: number
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  searchable,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
}: DataTableProps<TData>) {
  const [search, setSearch] = React.useState("")
  const [page, setPage] = React.useState(0)

  const getColKey = React.useCallback((col: Column<TData>) =>
    (col.accessorKey ?? col.key ?? "") as string, [])

  const filtered = React.useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    if (searchKey) {
      return data.filter((row) =>
        String(row[searchKey] ?? "").toLowerCase().includes(q)
      )
    }
    if (searchable) {
      return data.filter((row) =>
        columns.some((col) => {
          const k = getColKey(col)
          return String(row[k] ?? "").toLowerCase().includes(q)
        })
      )
    }
    return data
  }, [data, search, searchKey, searchable, columns, getColKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const showSearch = searchable || !!searchKey

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
      )}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={getColKey(col)}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length ? (
              paginated.map((row, i) => (
                <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                  {columns.map((col) => {
                    const k = getColKey(col)
                    return (
                      <TableCell key={k}>
                        {col.cell
                          ? col.cell(row)
                          : String(row[k] ?? "")}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pageCount - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
