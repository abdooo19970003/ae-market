import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export interface SubCategory {
  id: number
  name: string
  slug: string
  imageUrl?: string
  description?: string
  isActive: boolean
}

const SubCategories = ({ cats }: { cats: SubCategory[] }) => {
  return (
    <>
      {cats.map((cat) => (
        <Card
          className='flex flex-row items-center justify-start gap-1 p-2 my-3'
          key={cat.id}
        >
          <div className='cat_thumbnail aspect-square rounded-md max-w-1/3 border  '>
            <Image
              src={
                cat.imageUrl ||
                `https://placehold.co/50x50/transparent/00bf8199?text=${encodeURI(cat.name.toLocaleUpperCase())}`
              }
              alt={cat.name}
              width={50}
              height={50}
              className='object-cover'
            />
          </div>
          <div className='h-full w-full  '>
            <CardHeader className='w-full'>
              <CardTitle className='w-full text-lg'>{cat.name}</CardTitle>
            </CardHeader>
            <CardContent className='text-start text-muted-foreground'>
              <p>{cat.description}</p>
            </CardContent>
          </div>
          <Button
            asChild
            variant={'link'}
          >
            <Link href={`/dashboard/categories/${cat.id}`}>
              See Details <ArrowRight />
            </Link>
          </Button>
        </Card>
      ))}
    </>
  )
}
export default SubCategories
