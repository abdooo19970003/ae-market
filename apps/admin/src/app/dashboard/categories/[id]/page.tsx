import CategoryDetails from '@/components/categories/CategoryDetails'

export default async function CategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className='flex-1 space-y-4 p-8 pt-6'>
      <CategoryDetails id={id} />
    </div>
  )
}
