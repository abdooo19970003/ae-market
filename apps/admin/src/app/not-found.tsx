import { SearchIcon } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Kbd } from '@/components/ui/kbd'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function EmptyInputGroup() {
  return (
    <div className='place-content-center w-screen h-screen'>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 - Not Found</EmptyTitle>
          <EmptyDescription>
            The page you&apos;re looking for doesn&apos;t exist. Try searching
            for what you need below.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>
            Need help? <Link href='/support'>Contact support</Link>
          </EmptyDescription>
          <EmptyDescription className='my-3 flex gap-5'>
            <Button>
              <Link href={'/'}>Back Home</Link>
            </Button>
            <Button variant='secondary'>
              <Link href='/login'>Login</Link>
            </Button>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  )
}
export default EmptyInputGroup
