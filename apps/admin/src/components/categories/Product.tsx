import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export interface ProductInCategory {
  id: number
  name: string
  slug: string
  imageUrl?: string
  description?: string
  isActive: boolean
}

const Product = ({ product }: { product: ProductInCategory }) => {
  return (
    <Card className='flex w-fit min-w-75'>
      <CardHeader className=' '>
        <Image
          src={
            product.imageUrl ||
            `https://placehold.co/500x500/transparent/00bf8199?text=${encodeURI(product.name.toLocaleUpperCase())}`
          }
          alt=''
          width={500}
          height={300}
          className='object-cover border border-muted-foreground rounded-2xl'
        />
      </CardHeader>
      <CardContent className='flex-1'>
        <CardTitle className='font-semibold text-lg'>{product.name}</CardTitle>
        <CardDescription>
          <p>{product.description}</p>
        </CardDescription>
      </CardContent>
      <CardFooter className='flex justify-around'>
        <CardAction>
          <Button
            variant={'outline'}
            size={'lg'}
            asChild
            className=''
          >
            <Link
              className='px-2 py-1'
              href={`/dashboard/products/${product.id}`}
            >
              View Details <ArrowRight />
            </Link>
          </Button>
        </CardAction>
        <CardAction>
          <Button
            onClick={() => alert('Wanna Delete it ')}
            variant={'destructive'}
            size={'lg'}
            className=' '
          >
            Delete <Trash2 />
          </Button>
        </CardAction>
      </CardFooter>
    </Card>
  )
}

export default Product
