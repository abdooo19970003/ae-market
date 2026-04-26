'use client'

import { useQueries } from '@tanstack/react-query'
import {
  getCategoryById,
  getCategoryChildren,
  getCategoryProducts,
} from '../categoris.data'
import Details from './Details'
import Product, { ProductInCategory } from './Product'

const CategoryDetails = ({ id }: { id: string }) => {
  const data = useQueries({
    queries: [
      {
        queryKey: ['categories', id],
        queryFn: () => getCategoryById(id),
      },
      {
        queryKey: ['categoris', 'children', id],
        queryFn: () => getCategoryChildren(id),
      },
      {
        queryKey: ['categories', 'products', id],
        queryFn: () => getCategoryProducts(id),
      },
    ],
  })
  console.log({
    details: data[0].data,
    children: data[1].data,
    products: data[2].data,
  })
  return (
    <div>
      {data[0].isSuccess && data[1].isSuccess && (
        <Details data={{ sub_categories: data[1].data, ...data[0].data }} />
      )}
      <div className='mt-8'>
        <h1 className='text-3xl font-extrabold'>Products</h1>
        <div className='flex flex-wrap gap-6 justify-start items-center w-full'>
          {data[2].isSuccess &&
            data[2].data.length > 0 &&
            data[2].data.map((p: ProductInCategory) => (
              <Product
                product={p}
                key={p.id}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryDetails
