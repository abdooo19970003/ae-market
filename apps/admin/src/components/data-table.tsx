'use client'

import * as React from 'react'
import {
  ColumnDef,
  PaginationState,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  rowCount: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  rowCount,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Derive state from URL
  const page = Number(searchParams.get('page')) || 1
  const sort = searchParams.get('sort')
  const order = searchParams.get('order')
  const q = searchParams.get('q') || ''

  const sorting: SortingState = sort
    ? [{ id: sort, desc: order === 'desc' }]
    : []
  const pagination: PaginationState = { pageIndex: page - 1, pageSize: 10 }

  const createQueryString = React.useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null) newSearchParams.delete(key)
        else newSearchParams.set(key, String(value))
      }
      return newSearchParams.toString()
    },
    [searchParams],
  )

  const handleSortingChange = (updater: any) => {
    const nextState = typeof updater === 'function' ? updater(sorting) : updater
    const sortItem = nextState[0]
    startTransition(() => {
      router.push(
        `${pathname}?${createQueryString({
          sort: sortItem?.id ?? null,
          order: sortItem ? (sortItem.desc ? 'desc' : 'asc') : null,
          page: 1,
        })}`,
      )
    })
  }
  const pageCount = Math.ceil(rowCount / pagination.pageSize)

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      sorting,
      pagination,
      globalFilter: q,
    },
    onSortingChange: handleSortingChange,
  })
  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-muted bg-card shadow-sm overflow-hidden'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        isSortable &&
                          'cursor-pointer select-none hover:text-foreground transition-colors',
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className='flex items-center gap-2'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {isSortable && (
                          <span className='size-4'>
                            {{
                              asc: <ArrowUp className='size-4' />,
                              desc: <ArrowDown className='size-4' />,
                            }[header.column.getIsSorted() as string] ?? (
                              <ArrowUpDown className='size-4 opacity-30' />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className='hover:bg-muted/30 data-[state=selected]:bg-muted'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center text-muted-foreground'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            startTransition(() => {
              router.push(
                `${pathname}?${createQueryString({ page: page - 1 })}`,
              )
            })
          }}
          disabled={page <= 1}
        >
          <ChevronLeft className='size-4' /> Previous
        </Button>
        <div className='text-sm font-medium'>Page {page}</div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            startTransition(() => {
              router.push(
                `${pathname}?${createQueryString({ page: page + 1 })}`,
              )
            })
          }}
          disabled={pageCount ? page >= pageCount : false}
        >
          Next <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  )
}
