import { Button } from '@/components/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Edit, List, Trash } from 'lucide-react'
import { MdVerified } from 'react-icons/md'

import Link from 'next/link'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

export interface Category {
  id: number
  name: string
  slug: string
  imageUrl?: string
  description?: string
  parentId: number | null
  parentName?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export const categoryTableColumns: ColumnDef<Category>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell({ row }) {
      return (
        <div className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage src={row.original.imageUrl || ''} />
            <AvatarFallback className='font-bold'>
              {row.original.name[0] + row.original.name[1]}
            </AvatarFallback>
          </Avatar>
          <span>{row.original.name}</span>
          {row.original.isActive && <MdVerified />}
        </div>
      )
    },
  },

  {
    header: 'Description',
    accessorKey: 'description',
  },
  {
    header: 'Parent Category',
    accessorKey: 'parentId',
    cell({ row }) {
      const name = row.original.parentName
      if (!name) return <span className='text-muted-foreground'>Root</span>

      return <span>{name}</span>
    },
  },
  {
    header: 'Actions',
    cell(props) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              className='w-full flex justify-between items-center'
            >
              <span>Actions</span>
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href={`/dashboard/categories/${props.row.original.id}/edit`}
                className='w-full flex justify-between items-center'
              >
                <Edit />
                <span>Edit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='w-full flex justify-between items-center'>
              <Trash />
              <span>Delete</span>
            </DropdownMenuItem>
            <DropdownMenuItem className='w-full flex justify-between items-center'>
              <Link
                href={`/dashboard/categories/${props.row.original.id}`}
                className='w-full flex justify-between items-center'
              >
                <List />
                <span>Details</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
