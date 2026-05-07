'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { getAllCategories } from '../../../lib/actions/categories'
import { Spinner } from '@/components/ui/spinner'
import { DataTable } from '@/components/data-table'
import { categoryTableColumns } from './columns'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle, PlusIcon, PlusSquareIcon } from 'lucide-react'

export default function CategoriesPage() {
  const searchParams = useSearchParams()

  // Extract params for the API
  const page = searchParams.get('page') || '1'
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'
  const q = searchParams.get('q') || ''

  const { data, status, isPlaceholderData } = useQuery({
    queryKey: ['categories', { page, sort, order, q }],
    queryFn: () =>
      getAllCategories({
        sort,
        order,
        page,
        q,
      }),
    placeholderData: keepPreviousData,
  })
  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>
          Product Categories
        </h2>
        <Button
          asChild
          variant={'outline'}
        >
          <Link href={'/dashboard/categories/new'}>
            {' '}
            <PlusIcon /> New Category
          </Link>
        </Button>
      </div>
      {/* Only show full spinner on initial load, not during revalidation */}
      {status === 'pending' && !isPlaceholderData && (
        <div className='flex h-100 items-center justify-center'>
          <Spinner scale={3} />
        </div>
      )}

      {(status === 'success' || isPlaceholderData) && data && (
        <DataTable
          data={data[0]}
          columns={categoryTableColumns}
          rowCount={data[1][0].value}
        />
      )}
      {status === 'error' && <p>Error fetching categories</p>}
    </div>
  )
}
