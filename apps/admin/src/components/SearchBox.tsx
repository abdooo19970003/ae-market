'use client'
import { useForm } from '@tanstack/react-form'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { SearchIcon } from 'lucide-react'

const SearchBox = ({ ...props }) => {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      term: '',
    },
    onSubmit: async ({ value }) => {
      const { term } = value
      const params = new URLSearchParams(searchParams)
      if (term.trim()) {
        params.set('q', term)
      } else {
        params.delete('q')
      }
      startTransition(() => replace(pathname + '?' + params.toString()))
      console.log(value)
      return
    },
  })
  return (
    <form
      onSubmit={(e) => {
        ;(e.preventDefault(), e.stopPropagation())
        form.handleSubmit()
      }}
      {...props}
    >
      <form.Field
        name='term'
        children={(field) => {
          return (
            <InputGroup className='sm:w-3/4'>
              <InputGroupInput
                id={field.name}
                type='search'
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder='Try searching for pages...'
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'></InputGroupAddon>
            </InputGroup>
          )
        }}
      />
    </form>
  )
}

export default SearchBox
