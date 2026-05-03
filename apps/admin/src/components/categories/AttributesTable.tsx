'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, MoreHorizontal, Plus } from 'lucide-react'
import { CategoryAttribute, INPUT_TYPES } from '@/lib/types/category'
import AttributeModal from './AttributeModal'

interface AttributesTableProps {
  attributes: CategoryAttribute[]
  onAddAttribute: () => void
  onEditAttribute: (
    id: string | number,
    updates: Partial<CategoryAttribute>,
  ) => void
  onDeleteAttribute: (id: string | number) => void
}

export function AttributesTable({
  attributes,
  onAddAttribute,
  onEditAttribute,
  onDeleteAttribute,
}: AttributesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [editingId, setEditingId] = useState<string | number | null>(null)

  const columns: ColumnDef<CategoryAttribute>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='h-8 p-0'
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='font-medium'>{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => (
        <code className='text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded'>
          {row.getValue('slug')}
        </code>
      ),
    },
    {
      accessorKey: 'inputType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('inputType') as string
        const label = INPUT_TYPES.find((t) => t.value === type)?.label
        return <Badge variant='outline'>{label}</Badge>
      },
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => {
        const unit = row.getValue('unit')
        return unit ? (
          <span className='text-sm'>{unit as string}</span>
        ) : (
          <span className='text-gray-400 text-sm'>-</span>
        )
      },
    },
    {
      id: 'flags',
      header: 'Options',
      cell: ({ row }) => {
        const attr = row.original
        return (
          <div className='flex gap-1'>
            {attr.isRequired && (
              <Badge
                variant='secondary'
                className='text-xs'
              >
                Required
              </Badge>
            )}
            {attr.isFilterable && (
              <Badge
                variant='secondary'
                className='text-xs'
              >
                Filterable
              </Badge>
            )}
            {attr.options && attr.options.length > 0 && (
              <Badge
                variant='secondary'
                className='text-xs'
              >
                {attr.options.length} options
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const attr = row.original
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='h-8 w-8 p-0'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setEditingId(attr.id!)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteAttribute(attr.id!)}
                  className='text-red-600'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {editingId === attr.id && (
              <AttributeModal
                open={true}
                onOpenChange={(open) => !open && setEditingId(null)}
                attribute={attr}
                onSave={(updates) => {
                  onEditAttribute(attr.id!, updates)
                  setEditingId(null)
                }}
              />
            )}
          </>
        )
      },
    },
  ]

  const table = useReactTable({
    data: attributes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Attributes</h3>
        <Button
          onClick={onAddAttribute}
          size='sm'
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Attribute
        </Button>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
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
                  className='h-24 text-center text-gray-500'
                >
                  No attributes yet. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
