import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { EqualApproximately } from 'lucide-react'

const DashboardClient = () => {
  return (
    <div>
      Client Dashboard
      <div className=''>
        <Empty className='w-full'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <EqualApproximately />
            </EmptyMedia>
            <EmptyTitle>No Content</EmptyTitle>
            <EmptyDescription>
              Please wait until we implement this page
            </EmptyDescription>
          </EmptyHeader>
        </Empty>{' '}
      </div>
    </div>
  )
}

export default DashboardClient
