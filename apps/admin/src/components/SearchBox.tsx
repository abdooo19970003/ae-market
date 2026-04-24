'use client'
import { useForm } from '@tanstack/react-form'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { SearchIcon } from 'lucide-react'

const SearchBox = ({ ...props }) => {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentQuery = searchParams.get('q')
  const inputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      term: currentQuery || '',
    },
    onSubmit: async ({ value }) => {
      const { term } = value
      const params = new URLSearchParams(searchParams)
      if (term.trim()) {
        params.set('q', term)
      } else {
        params.delete('q')
      }
      inputRef.current?.blur()

      startTransition(() => replace(pathname + '?' + params.toString()))
      console.log(value)
      return
    },
  })

  useEffect(() => {
    //update form value if url changed
    form.setFieldValue('term', currentQuery || '')
  }, [pathname, currentQuery])

  useEffect(() => {
    // track key down event
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
                ref={inputRef}
                type='search'
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder='search ...'
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupAddon align='inline-end'>
                {' '}
                <kbd>ctrl + k</kbd>
              </InputGroupAddon>
            </InputGroup>
          )
        }}
      />
    </form>
  )
}

export default SearchBox
