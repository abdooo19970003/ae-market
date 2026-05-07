import Image from 'next/image'
import { MdVerified } from 'react-icons/md'
import SubCategories, { SubCategory } from './SubCategories'
import { Card } from '@/components/ui/card'

interface CategoryDetais {
  id: number
  name: string
  slug: string
  imageUrl?: string
  description?: string
  isActive: boolean
  sub_categories: SubCategory[]
}

const Details = ({ data }: { data: CategoryDetais }) => {
  return (
    <div>
      <div className='w-full md:min-h-75 flex flex-col md:flex-row gap-2'>
        <div className='  w-full sm:place-items-center md:place-items-baseline  '>
          <Image
            src={
              data.imageUrl ||
              `https://placehold.co/500x500/transparent/00bf8199?text=${encodeURI(data.name.toLocaleUpperCase())}`
            }
            alt={data.name}
            width={350}
            height={300}
            className='object-cover border rounded-2xl border-black dark:border-white '
          />
        </div>
        <div className='details min-w-2/3'>
          <h1 className='text-3xl font-extrabold'>
            {data.name}
            {data.isActive && <MdVerified className='inline text-lg' />}
          </h1>
          <div className=''>
            <div className='grid grid-cols-4 gap-4 my-4'>
              <span className='font-semibold text-muted-foreground col-span-1'>
                Category Name
              </span>
              <span className='col-span-3'>{data.name}</span>
            </div>
            <div className='grid grid-cols-4 gap-4 my-4'>
              <span className='font-semibold text-muted-foreground col-span-1'>
                Category Description
              </span>
              <span className='col-span-3'>{data.description}</span>
            </div>
            <Card className='grid grid-cols-4 gap-4 my-4 p-1'>
              <span className='font-semibold text-lg text-muted-foreground col-span-1'>
                Sub Categories
              </span>
              <div className='col-span-4 ps-10'>
                {data.sub_categories.length === 0 && (
                  <p className='text-center  w-full text-muted-foreground'>
                    No Sub Categories found
                  </p>
                )}
                <SubCategories cats={data.sub_categories} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Details
